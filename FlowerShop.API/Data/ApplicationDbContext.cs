using Microsoft.EntityFrameworkCore;
using FlowerShop.API.Models;

namespace FlowerShop.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Order>()
                .HasMany(o => o.Items)
                .WithOne()
                .HasForeignKey(oi => oi.Id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Product>().HasData(
                new Product
                {
                    Id = 1,
                    Name = "Нежный букет из кустовой персиковой хризантемой",
                    Description = "Красивый и нежный букет из свежих хризантем",
                    Price = 2925,
                    Stock = 10,
                    ImageUrl = "/images/bouquet1.jpg",
                    Category = "Букеты",
                    Rating = 4.95,
                    IsAvailable = true
                },
                new Product
                {
                    Id = 2,
                    Name = "Lace bouquet with French rose",
                    Description = "Изысканный букет с французскими розами",
                    Price = 3362,
                    Stock = 8,
                    ImageUrl = "/images/bouquet2.jpg",
                    Category = "Букеты",
                    Rating = 4.88,
                    IsAvailable = true
                },
                new Product
                {
                    Id = 3,
                    Name = "Duobucket of peony-shaped roses",
                    Description = "Пионовидные розы Silva pink в двойной корзине",
                    Price = 2943,
                    Stock = 5,
                    ImageUrl = "/images/bouquet3.jpg",
                    Category = "Букеты",
                    Rating = 4.82,
                    IsAvailable = true
                },
                new Product
                {
                    Id = 4,
                    Name = "Bouquet of peony-shaped roses",
                    Description = "Букет из пионовидных роз Silva pink и Bombastic",
                    Price = 3995,
                    Stock = 3,
                    ImageUrl = "/images/bouquet4.jpg",
                    Category = "Букеты",
                    Rating = 4.67,
                    IsAvailable = true
                }
            );

            // (password: Admin123!)
            modelBuilder.Entity<User>().HasData(new User
            {
                Id = 1,
                Email = "admin@flowershop.com",
                PasswordHash = "$2a$11$KjX8Yx9ZxLmNpOqRtSuVvWxYzAbCdEfGhIjKlMnOpQrStUvWxYzA",
                FullName = "System Administrator",
                Phone = "+70000000000",
                Role = UserRole.Admin,
                CreatedAt = DateTime.UtcNow
            });
        }
    }
}