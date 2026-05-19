// Models/AdminStats.cs (обновленный)
namespace FlowerShop.API.Models
{
    public class AdminStats
    {
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public int PendingOrders { get; set; }
        public int ActiveCouriers { get; set; }
        public int ActiveFlorists { get; set; }
        public Dictionary<string, int> OrdersByStatus { get; set; }
        public List<TopProduct> TopProducts { get; set; }
        public List<DailyRevenue> DailyRevenue { get; set; }
    }

    public class TopProduct
    {
        public string Name { get; set; }
        public int Count { get; set; }
        public decimal Revenue { get; set; }
    }

    public class DailyRevenue
    {
        public DateTime Date { get; set; }
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
    }
}