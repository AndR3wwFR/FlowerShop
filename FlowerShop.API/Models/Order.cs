namespace FlowerShop.API.Models
{
    public class Order
    {
        public int Id { get; set; }
        public string CustomerName { get; set; }
        public string Phone { get; set; }

        public string Address {  get; set; }
        public string DeliveryTime { get; set; }

        public List<string> Items { get; set; } = new();
        public decimal TotalPrice { get; set; }

        public OrderStatus Status { get; set; } = OrderStatus.New;

    }

    public enum OrderStatus
    {
        New,
        Assembling,
        Ready,
        Delivering,
        Completed
    }
}
