using FlowerShop.API.Models;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class FlowersController : ControllerBase
{
    private readonly AppDbContext _db;

    public FlowersController(AppDbContext db)
    {
        _db = db;
    }
    [HttpGet]
    public List<Product> Get()
    {
        return _db.Products.ToList();
    }

    [HttpPost]
    public IActionResult Post(Product flower)
    {
        if (flower == null) return BadRequest();

        _db.Products.Add(flower);
        _db.SaveChanges();       

        return Ok(flower); 
    }
}
