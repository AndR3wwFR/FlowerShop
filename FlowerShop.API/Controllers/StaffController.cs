using FlowerShop.API.Models;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/staff")]
public class StaffController : ControllerBase
{
    // Флорист видит заказы для сборки
    [HttpGet("florist/tasks")]
    public IActionResult GetFloristTasks() =>
        Ok(DataStorage.Orders.Where(o => o.Status == OrderStatus.New || o.Status == OrderStatus.Assembling));

    // Курьер видит только готовые к доставке заказы
    [HttpGet("courier/tasks")]
    public IActionResult GetCourierTasks() =>
        Ok(DataStorage.Orders.Where(o => o.Status == OrderStatus.Ready));

    // Общий метод смены статуса (Флорист ставит "Ready", Курьер ставит "Completed")
    [HttpPatch("update-status/{id}")]
    public IActionResult UpdateStatus(int id, [FromBody] OrderStatus newStatus)
    {
        var order = DataStorage.Orders.FirstOrDefault(o => o.Id == id);
        if (order == null) return NotFound();

        order.Status = newStatus;
        return Ok();
    }
}
