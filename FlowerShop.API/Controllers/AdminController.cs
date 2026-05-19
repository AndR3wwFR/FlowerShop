using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FlowerShop.API.Data;
using FlowerShop.API.Models;
using FlowerShop.API.DTOs;

namespace FlowerShop.API.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var orders = await _context.Orders.ToListAsync();
            var completedOrders = orders.Where(o => o.Status == OrderStatus.Completed);

            var stats = new AdminStats
            {
                TotalRevenue = completedOrders.Sum(o => o.TotalPrice),
                TotalOrders = orders.Count,
                PendingOrders = orders.Count(o => o.Status == OrderStatus.New),
                ActiveCouriers = await _context.Users.CountAsync(u => u.Role == UserRole.Courier),
                ActiveFlorists = await _context.Users.CountAsync(u => u.Role == UserRole.Florist),
                OrdersByStatus = Enum.GetValues(typeof(OrderStatus))
                    .Cast<OrderStatus>()
                    .ToDictionary(s => s.ToString(), s => orders.Count(o => o.Status == s)),
                TopProducts = await _context.OrderItems
                    .GroupBy(i => i.ProductName)
                    .Select(g => new TopProduct
                    {
                        Name = g.Key,
                        Count = g.Sum(i => i.Quantity),
                        Revenue = g.Sum(i => i.Price * i.Quantity)
                    })
                    .OrderByDescending(t => t.Count)
                    .Take(5)
                    .ToListAsync(),
                DailyRevenue = await _context.Orders
                    .Where(o => o.Status == OrderStatus.Completed)
                    .GroupBy(o => o.CreatedAt.Date)
                    .Select(g => new DailyRevenue
                    {
                        Date = g.Key,
                        Revenue = g.Sum(o => o.TotalPrice),
                        OrderCount = g.Count()
                    })
                    .OrderByDescending(d => d.Date)
                    .Take(30)
                    .ToListAsync()
            };

            return Ok(stats);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new { u.Id, u.Email, u.FullName, u.Phone, u.Role, u.CreatedAt })
                .ToListAsync();
            return Ok(users);
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromQuery] UserRole role)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            user.Role = role;
            await _context.SaveChangesAsync();
            return Ok(user);
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}