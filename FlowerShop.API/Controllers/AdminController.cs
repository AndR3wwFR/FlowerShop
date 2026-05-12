using FlowerShop.API.Models;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public IActionResult GetStats()
    {
        var stats = new
        {
            TotalRevenue = _context.Orders
                .Where(o => o.Status == OrderStatus.Completed)
                .Sum(o => o.TotalPrice),
            TotalOrders = _context.Orders.Count()
        };
        return Ok(stats);
    }

    [HttpDelete("delete-order/{id}")]
    public IActionResult DeleteOrder(int id)
    {
        var order = _context.Orders.Find(id);
        if (order == null) return NotFound();

        _context.Orders.Remove(order);
        _context.SaveChanges();
        return Ok();
    }
}
