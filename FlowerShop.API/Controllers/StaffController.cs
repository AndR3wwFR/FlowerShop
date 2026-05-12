using FlowerShop.API.Models;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/staff")]
public class StaffController : ControllerBase
{
    private readonly AppDbContext _context;

    public StaffController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("tasks")]
    public IActionResult GetTasks([FromQuery] OrderStatus status)
    {
        // Фильтруем заказы в базе по статусу
        var tasks = _context.Orders.Where(o => o.Status == status).ToList();
        return Ok(tasks);
    }

    [HttpPatch("update-status/{id}")]
    public IActionResult UpdateStatus(int id, [FromBody] OrderStatus newStatus)
    {
        var order = _context.Orders.Find(id);
        if (order == null) return NotFound();

        order.Status = newStatus;
        _context.SaveChanges();
        return Ok();
    }
}
