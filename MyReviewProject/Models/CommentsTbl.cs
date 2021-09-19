using System;
using System.Collections.Generic;

#nullable disable

namespace MyReviewProject.Models
{
    public partial class CommentsTbl
    {
        public string Id { get; set; }
        public string Commenter { get; set; }
        public string CommentDescription { get; set; }
        public string ReviewIdcommentedOn { get; set; }
        public DateTime? Date { get; set; }
    }
}
