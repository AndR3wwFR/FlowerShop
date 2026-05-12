using FlowerShop.API.Models;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/shop")]
public class ShopController : ControllerBase
{
    private readonly AppDbContext _context;
    public ShopController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("flowers")]
    public IActionResult GetFlowers()
    {
        return Ok(_context.Products.Where(p => p.Stock > 0).ToList());
    }

    [HttpPost("checkout")]
    public IActionResult CreateOrder(Order order)
    {
        order.Status = OrderStatus.New;
        _context.Orders.Add(order);
        _context.SaveChanges();   
        return Ok(new { order.Id, Message = "Заказ принят и сохранен в базе!" });
    }
}
