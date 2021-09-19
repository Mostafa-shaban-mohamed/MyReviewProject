using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

#nullable disable

namespace MyReviewProject.Models
{
    public partial class MyReviewDBContext : DbContext
    {
        public MyReviewDBContext()
        {
        }

        public MyReviewDBContext(DbContextOptions<MyReviewDBContext> options)
            : base(options)
        {
        }

        public virtual DbSet<CommentsTbl> CommentsTbls { get; set; }
        public virtual DbSet<ReviewsTbl> ReviewsTbls { get; set; }

        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasAnnotation("Relational:Collation", "SQL_Latin1_General_CP1_CI_AS");

            modelBuilder.Entity<CommentsTbl>(entity =>
            {
                //entity.HasNoKey();
                //entity.HasKey("ID");

                entity.ToTable("Comments_tbl");

                entity.Property(e => e.CommentDescription).IsRequired();

                entity.Property(e => e.Commenter).IsRequired();

                entity.Property(e => e.Date).HasColumnType("date");

                entity.Property(e => e.Id)
                    .IsRequired()
                    .HasColumnName("ID");

                entity.Property(e => e.ReviewIdcommentedOn)
                    .IsRequired()
                    .HasColumnName("ReviewIDCommentedOn");

            });

            modelBuilder.Entity<ReviewsTbl>(entity =>
            {
                //entity.HasNoKey();
                //entity.HasKey("ID");

                entity.ToTable("Reviews_tbl");

                entity.Property(e => e.Id)
                    .IsRequired()
                    .HasColumnName("ID");

                entity.Property(e => e.NoOfComments).HasColumnName("No_of_Comments");

                entity.Property(e => e.ProductReviewed)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.ReviewDescription).IsRequired();

                entity.Property(e => e.Reviewer).IsRequired();

                entity.Property(e => e.Keywords).HasColumnName("Keywords");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
