using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyReviewProject.Data;
using MyReviewProject.Models;

namespace MyReviewProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly MyReviewDBContext _context;

        public ReviewsController(MyReviewDBContext context)
        {
            _context = context;
        }

        // GET: api/Reviews
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReviewsTbl>>> GetReviewsTbls(int? pagenumber = 1)
        {
            int pageSize = 3;
            return await _context.ReviewsTbls.Skip((int)((pagenumber-1)*pageSize)).Take(pageSize).ToListAsync();
        }

        //display My review list
        // GET: api/Reviews/email
        //[HttpGet("{email}")]
        //public async Task<ActionResult<IEnumerable<ReviewsTbl>>> GetReviewsTbls(string email)
        //{
        //    var reviewsTbl = await _context.ReviewsTbls.Where(m => m.Reviewer == email).ToArrayAsync();

        //    if (reviewsTbl == null)
        //    {
        //        return NotFound();
        //    }

        //    return reviewsTbl;
        //}

        //search method
        // GET: api/Reviews/5
        [HttpGet("{search}")]
        public ActionResult<IEnumerable<ReviewsTbl>> GetSearchResult(string search)
        {
            // search for title first then keywords
            var results = _context.ReviewsTbls
                .Where(m => m.ProductReviewed.IndexOf(search) != -1 || 
                (m.Keywords != null && m.Keywords.IndexOf(search) != -1)).ToArray();

            if(results == null)
            {
                return NoContent();
            }

            return results;
        }

        //edit method
        // PUT: api/Reviews/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutReviewsTbl(string id, ReviewsTbl reviewsTbl)
        {
            if (id != reviewsTbl.Id)
            {
                return BadRequest();
            }

            var oldreview = _context.ReviewsTbls.Find(id);

            if (!string.IsNullOrEmpty(reviewsTbl.ProductReviewed))
            {
                oldreview.ProductReviewed = reviewsTbl.ProductReviewed;
            }
            if (!string.IsNullOrEmpty(reviewsTbl.ReviewDescription))
            {
                oldreview.ReviewDescription = reviewsTbl.ReviewDescription;
            }
            if (!double.IsNaN(reviewsTbl.FinalRating))
            {
                oldreview.FinalRating = reviewsTbl.FinalRating;
            }
            if (!string.IsNullOrEmpty(reviewsTbl.Reviewer))
            {
                oldreview.Reviewer = reviewsTbl.Reviewer;
            }

            _context.Entry(oldreview).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        //Generate Hash code of ID
        public string IdGenerator()
        {
            var bytes = new byte[16];
            using (var rng = new RNGCryptoServiceProvider())
            {
                rng.GetBytes(bytes);
            }

            // and if you need it as a string...
            string hash1 = BitConverter.ToString(bytes);

            return hash1;
        }


        //Create Method
        // POST: api/Reviews
        [HttpPost]
        public async Task<ActionResult<ReviewsTbl>> PostReviewsTbl(ReviewsTbl reviewsTbl)
        {
            //add id, reviewer and no of comments
            reviewsTbl.Id = IdGenerator();

            //reviewsTbl.Reviewer = ""; //this might bite me later.....
            reviewsTbl.NoOfComments = 0;
            //add new record to database
            _context.ReviewsTbls.Add(reviewsTbl);

            await _context.SaveChangesAsync();

            return CreatedAtAction("GetReviewsTbl", new { id = reviewsTbl.Id }, reviewsTbl);
        }

        //delete method
        // DELETE: api/Reviews/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReviewsTbl(string id)
        {
            var reviewsTbl = await _context.ReviewsTbls.FindAsync(id);
            if (reviewsTbl == null)
            {
                return NotFound();
            }

            _context.ReviewsTbls.Remove(reviewsTbl);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ReviewsTblExists(string id)
        {
            return _context.ReviewsTbls.Any(e => e.Id == id);
        }
    }
}
