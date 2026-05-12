using FlowerShop.API.Models;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/shop")]
public class ShopController : ControllerBase
{
    [HttpGet("flowers")] // Посмотреть витрину
    public IActionResult GetFlowers() => Ok(DataStorage.Products);

    [HttpPost("checkout")] // Купить
    public IActionResult CreateOrder(Order order)
    {
        order.Id = DataStorage.Orders.Count + 1;
        order.Status = OrderStatus.New;
        DataStorage.Orders.Add(order);
        return Ok(new { order.Id, Message = "Заказ принят!" });
    }
}
