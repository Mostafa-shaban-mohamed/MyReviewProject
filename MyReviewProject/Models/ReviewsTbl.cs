using System;
using System.Collections.Generic;

#nullable disable

namespace MyReviewProject.Models
{
    public partial class ReviewsTbl
    {
        public string Id { get; set; }
        public string ProductReviewed { get; set; }
        public string ReviewDescription { get; set; }
        public double FinalRating { get; set; }
        public string Reviewer { get; set; }
        public int NoOfComments { get; set; }
        public string Keywords { get; set; }
    }
}
