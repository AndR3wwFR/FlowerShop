// Models/Product.cs (обновленный)
namespace FlowerShop.API.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string ImageUrl { get; set; } = "images/default.jpg";
        public string Category { get; set; }
        public double Rating { get; set; }
        public bool IsAvailable { get; set; } = true;
    }
}