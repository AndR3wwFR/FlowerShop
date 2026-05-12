using FlowerShop.API.Models;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    // Админ видит ВСЕ заказы без фильтров
    [HttpGet("all-orders")]
    public IActionResult GetAllOrders() => Ok(DataStorage.Orders);

    // Управление ценами (чего не может флорист)
    [HttpPatch("update-price/{flowerId}")]
    public IActionResult UpdatePrice(int flowerId, [FromBody] decimal newPrice)
    {
        var flower = DataStorage.Products.FirstOrDefault(f => f.Id == flowerId);
        if (flower == null) return NotFound();
        flower.Price = newPrice;
        return Ok();
    }

    // Отчетность
    [HttpGet("stats")]
    public IActionResult GetStats() => Ok(new
    {
        TotalRevenue = DataStorage.Orders.Where(o => o.Status == OrderStatus.Completed).Sum(o => o.TotalPrice),
        TotalOrders = DataStorage.Orders.Count
    });
}
