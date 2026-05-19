using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FlowerShop.API.Data;
using FlowerShop.API.Models;
using System.Security.Claims;

namespace FlowerShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }


        [Authorize(Roles = "Customer")]
        [HttpPost]
        public async Task<IActionResult> CreateOrder(Order order)
        {
            order.UserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            order.Status = OrderStatus.New;
            order.CreatedAt = DateTime.UtcNow;

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return Ok(order);
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var orders = await _context.Orders
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
            return Ok(orders);
        }


        [Authorize(Roles = "Florist")]
        [HttpGet("for-assembly")]
        public async Task<IActionResult> GetOrdersForAssembly()
        {
            var orders = await _context.Orders
                .Where(o => o.Status == OrderStatus.New)
                .ToListAsync();
            return Ok(orders);
        }

        [Authorize(Roles = "Florist")]
        [HttpPut("{id}/start-assembly")]
        public async Task<IActionResult> StartAssembly(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
                return NotFound();

            var floristId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            order.Status = OrderStatus.Assembling;
            order.FloristId = floristId;

            await _context.SaveChangesAsync();
            return Ok(order);
        }

        [Authorize(Roles = "Florist")]
        [HttpPut("{id}/ready")]
        public async Task<IActionResult> MarkAsReady(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
                return NotFound();

            order.Status = OrderStatus.Ready;
            await _context.SaveChangesAsync();
            return Ok(order);
        }


        [Authorize(Roles = "Courier")]
        [HttpGet("for-delivery")]
        public async Task<IActionResult> GetOrdersForDelivery()
        {
            var orders = await _context.Orders
                .Where(o => o.Status == OrderStatus.Ready)
                .ToListAsync();
            return Ok(orders);
        }

        [Authorize(Roles = "Courier")]
        [HttpPut("{id}/start-delivery")]
        public async Task<IActionResult> StartDelivery(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
                return NotFound();

            var courierId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            order.Status = OrderStatus.Delivering;
            order.CourierId = courierId;

            await _context.SaveChangesAsync();
            return Ok(order);
        }

        [Authorize(Roles = "Courier")]
        [HttpPut("{id}/complete")]
        public async Task<IActionResult> CompleteDelivery(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
                return NotFound();

            order.Status = OrderStatus.Completed;
            await _context.SaveChangesAsync();
            return Ok(order);
        }


        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.Items)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
            return Ok(orders);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return NotFound(new { message = "Заказ не найден" });

            return Ok(order);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, [FromBody] UpdateOrderRequest request)
        {
            var order = await _context.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return NotFound(new { message = "Заказ не найден" });

            // Обновляем основные поля
            order.CustomerName = request.CustomerName;
            order.Phone = request.Phone;
            order.Address = request.Address;
            order.DeliveryTime = request.DeliveryTime;
            order.TotalPrice = request.TotalPrice;
            order.Status = request.Status;
            order.Comment = request.Comment;

            // Обновляем товары в заказе
            if (request.Items != null && request.Items.Any())
            {
                _context.OrderItems.RemoveRange(order.Items);
                order.Items = request.Items.Select(i => new OrderItem
                {
                    ProductId = i.ProductId,
                    ProductName = i.ProductName,
                    Quantity = i.Quantity,
                    Price = i.Price
                }).ToList();
            }

            await _context.SaveChangesAsync();
            return Ok(order);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
                return NotFound(new { message = "Заказ не найден" });

            _context.OrderItems.RemoveRange(order.Items);
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Заказ удален" });
        }

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromQuery] OrderStatus status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
                return NotFound(new { message = "Заказ не найден" });

            order.Status = status;
            await _context.SaveChangesAsync();

            return Ok(order);
        }
    }

    public class UpdateOrderRequest
    {
        public string CustomerName { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string DeliveryTime { get; set; }
        public List<OrderItemDto> Items { get; set; }
        public decimal TotalPrice { get; set; }
        public OrderStatus Status { get; set; }
        public string Comment { get; set; }
    }

    public class OrderItemDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}