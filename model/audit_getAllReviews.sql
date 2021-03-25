-- getAllReviews
SELECT
  product_id, r.id AS review_id, rating, summary, recommend,
  response, body, date, reviewer_name,
  helpfulness, rp.id AS review_photo_id, rp.url
FROM reviews r
LEFT JOIN reviews_photos rp ON r.id = rp.review_id
WHERE
  product_id = $1
  AND reported = FALSE;

/**
EXPLAIN ANALYZE SELECT
product_id, r.id AS review_id, rating, summary, recommend,
response, body, date, reviewer_name,
helpfulness, rp.id AS review_photo_id, rp.url
FROM reviews r
LEFT JOIN reviews_photos rp ON r.id = rp.review_id
WHERE
product_id = 928347
AND reported = FALSE
ORDER BY helpfulness DESC, date ASC;

QUERY PLAN
--------------------------------------------------------------------------------------------------------------------------------------------------------------
 Sort  (cost=427.12..427.24 rows=49 width=423) (actual time=4.144..4.147 rows=9 loops=1)
   Sort Key: r.helpfulness DESC, r.date
   Sort Method: quicksort  Memory: 29kB
   ->  Nested Loop Left Join  (cost=0.86..425.74 rows=49 width=423) (actual time=3.614..3.656 rows=9 loops=1)
         ->  Index Scan using reviews_product_id_idx on reviews r  (cost=0.43..11.33 rows=49 width=291) (actual time=2.044..2.050 rows=9 loops=1)
               Index Cond: (product_id = 928347)
               Filter: (NOT reported)
         ->  Index Scan using reviews_photos_review_id_idx on reviews_photos rp  (cost=0.43..8.45 rows=1 width=140) (actual time=0.176..0.176 rows=0 loops=9)
               Index Cond: (review_id = r.id)
 Planning Time: 1.161 ms
 Execution Time: 6.243 ms

EXPLAIN ANALYZE (FORMAT JSON) SELECT
product_id, r.id AS review_id, rating, summary, recommend,
response, body, date, reviewer_name,
helpfulness, rp.id AS review_photo_id, rp.url
FROM reviews r
LEFT JOIN reviews_photos rp ON r.id = rp.review_id
WHERE
product_id = 823412
AND reported = FALSE
ORDER BY helpfulness DESC, date ASC;

 [
   {
     "Plan": {
       "Node Type": "Sort",
       "Parallel Aware": false,
       "Startup Cost": 427.12,
       "Total Cost": 427.24,
       "Plan Rows": 49,
       "Plan Width": 423,
       "Sort Key": ["r.helpfulness DESC", "r.date"],
       "Plans": [
         {
           "Node Type": "Nested Loop",
           "Parent Relationship": "Outer",
           "Parallel Aware": false,
           "Join Type": "Left",
           "Startup Cost": 0.86,
           "Total Cost": 425.74,
           "Plan Rows": 49,
           "Plan Width": 423,
           "Inner Unique": false,
           "Plans": [
             {
               "Node Type": "Index Scan",
               "Parent Relationship": "Outer",
               "Parallel Aware": false,
               "Scan Direction": "Forward",
               "Index Name": "reviews_product_id_idx",
               "Relation Name": "reviews",
               "Alias": "r",
               "Startup Cost": 0.43,
               "Total Cost": 11.33,
               "Plan Rows": 49,
               "Plan Width": 291,
               "Index Cond": "(product_id = 823412)",
               "Filter": "(NOT reported)"
             },
             {
               "Node Type": "Index Scan",
               "Parent Relationship": "Inner",
               "Parallel Aware": false,
               "Scan Direction": "Forward",
               "Index Name": "reviews_photos_review_id_idx",
               "Relation Name": "reviews_photos",
               "Alias": "rp",
               "Startup Cost": 0.43,
               "Total Cost": 8.45,
               "Plan Rows": 1,
               "Plan Width": 140,
               "Index Cond": "(review_id = r.id)"
             }
           ]
         }
       ]
     }
   }
 ]
*/
