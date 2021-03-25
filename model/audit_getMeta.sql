-- getMeta
SELECT c.id, c.name, AVG(cr.value) AS average
FROM characteristics c
JOIN characteristic_reviews cr ON c.id = cr.characteristic_id
WHERE c.product_id = $1
GROUP BY c.id, c.name
ORDER BY c.id ASC;

/*
  EXPLAIN ANALYZE SELECT c.id, c.name, AVG(cr.value) AS average
  FROM characteristic_reviews cr
  JOIN characteristics c ON cr.characteristic_id = c.id
  WHERE cr.review_id IN (
    SELECT id
    FROM reviews
    WHERE product_id = 892345
  )
  GROUP BY c.id, c.name
  ORDER BY c.id ASC;

  QUERY PLAN
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 GroupAggregate  (cost=545.22..548.64 rows=171 width=42) (actual time=9.009..9.022 rows=4 loops=1)
   Group Key: c.id
   ->  Sort  (cost=545.22..545.64 rows=171 width=12) (actual time=8.975..8.980 rows=44 loops=1)
         Sort Key: c.id
         Sort Method: quicksort  Memory: 27kB
         ->  Nested Loop  (cost=1.30..538.87 rows=171 width=12) (actual time=8.742..8.889 rows=44 loops=1)
               ->  Nested Loop  (cost=0.87..461.27 rows=171 width=10) (actual time=6.702..6.751 rows=44 loops=1)
                     ->  Index Scan using reviews_product_id_idx on reviews  (cost=0.43..11.33 rows=51 width=4) (actual time=4.869..4.872 rows=11 loops=1)
                           Index Cond: (product_id = 892345)
                     ->  Index Scan using characteristic_reviews_review_id_idx on characteristic_reviews cr  (cost=0.44..8.68 rows=14 width=18) (actual time=0.168..0.169 rows=4 loops=11)
                           Index Cond: (review_id = reviews.id)
               ->  Index Scan using characteristics_pkey on characteristics c  (cost=0.43..0.45 rows=1 width=10) (actual time=0.048..0.048 rows=1 loops=44)
                     Index Cond: (id = cr.characteristic_id)
 Planning Time: 0.692 ms
 Execution Time: 9.090 ms

  wait... chracteristics table already contains the product_id
  I could knock out my sub query in my WHERE clause and just use the product_id to find the
    characteristics I want and join them with the characteristic_reviews table
  SELECT c.id, c.name, AVG(cr.value) AS average
  FROM characteristic_reviews cr
  JOIN characteristics c ON cr.characteristic_id = c.id
  WHERE c.product_id = 399999
  GROUP BY c.id, c.name
  ORDER BY c.id ASC;

  EXPLAIN ANALYZE SELECT c.id, c.name, AVG(cr.value) AS average
  FROM characteristic_reviews cr
  JOIN characteristics c ON cr.characteristic_id = c.id
  WHERE c.product_id = 399999
  GROUP BY c.id, c.name
  ORDER BY c.id ASC;

  QUERY PLAN
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Finalize GroupAggregate  (cost=244918.63..244919.76 rows=4 width=42) (actual time=11399.528..11399.633 rows=4 loops=1)
   Group Key: c.id
   ->  Gather Merge  (cost=244918.63..244919.67 rows=8 width=42) (actual time=11399.513..11399.582 rows=5 loops=1)
         Workers Planned: 2
         Workers Launched: 2
         ->  Partial GroupAggregate  (cost=243918.60..243918.72 rows=4 width=42) (actual time=11390.935..11390.939 rows=2 loops=3)
               Group Key: c.id
               ->  Sort  (cost=243918.60..243918.63 rows=10 width=12) (actual time=11390.921..11390.923 rows=5 loops=3)
                     Sort Key: c.id
                     Sort Method: quicksort  Memory: 25kB
                     Worker 0:  Sort Method: quicksort  Memory: 25kB
                     Worker 1:  Sort Method: quicksort  Memory: 25kB
                     ->  Hash Join  (cost=8.55..243918.44 rows=10 width=12) (actual time=6109.334..11390.881 rows=5 loops=3)
                           Hash Cond: (cr.characteristic_id = c.id)
                           ->  Parallel Seq Scan on characteristic_reviews cr  (cost=0.00..222759.57 rows=8057257 width=10) (actual time=3.852..10434.805 rows=6445809 loops=3)
                           ->  Hash  (cost=8.50..8.50 rows=4 width=10) (actual time=0.130..0.130 rows=4 loops=3)
                                 Buckets: 1024  Batches: 1  Memory Usage: 9kB
                                 ->  Index Scan using characteristics_product_id_idx on characteristics c  (cost=0.43..8.50 rows=4 width=10) (actual time=0.102..0.105 rows=4 loops=3)
                                       Index Cond: (product_id = 389999)
 Planning Time: 1.583 ms
 Execution Time: 11400.455 ms

  still slow.. maybe it has something to do with my base FROM table
  EXPLAIN ANALYZE SELECT c.id, c.name, AVG(cr.value) AS average
  FROM characteristics c
  JOIN characteristic_reviews cr ON c.id = cr.characteristic_id
  WHERE c.product_id = 399399
  GROUP BY c.id, c.name
  ORDER BY c.id ASC;

  QUERY PLAN
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Finalize GroupAggregate  (cost=244918.63..244919.76 rows=4 width=42) (actual time=10885.410..10885.552 rows=0 loops=1)
   Group Key: c.id
   ->  Gather Merge  (cost=244918.63..244919.67 rows=8 width=42) (actual time=10885.407..10885.548 rows=0 loops=1)
         Workers Planned: 2
         Workers Launched: 2
         ->  Partial GroupAggregate  (cost=243918.60..243918.72 rows=4 width=42) (actual time=10871.246..10871.249 rows=0 loops=3)
               Group Key: c.id
               ->  Sort  (cost=243918.60..243918.63 rows=10 width=12) (actual time=10871.244..10871.246 rows=0 loops=3)
                     Sort Key: c.id
                     Sort Method: quicksort  Memory: 25kB
                     Worker 0:  Sort Method: quicksort  Memory: 25kB
                     Worker 1:  Sort Method: quicksort  Memory: 25kB
                     ->  Hash Join  (cost=8.55..243918.44 rows=10 width=12) (actual time=10871.161..10871.163 rows=0 loops=3)
                           Hash Cond: (cr.characteristic_id = c.id)
                           ->  Parallel Seq Scan on characteristic_reviews cr  (cost=0.00..222759.57 rows=8057257 width=10) (actual time=0.851..9848.481 rows=6445809 loops=3)
                           ->  Hash  (cost=8.50..8.50 rows=4 width=10) (actual time=0.152..0.153 rows=1 loops=3)
                                 Buckets: 1024  Batches: 1  Memory Usage: 9kB
                                 ->  Index Scan using characteristics_product_id_idx on characteristics c  (cost=0.43..8.50 rows=4 width=10) (actual time=0.140..0.141 rows=1 loops=3)
                                       Index Cond: (product_id = 399399)
 Planning Time: 0.644 ms
 Execution Time: 10885.698 ms

  turns out chracteristic_reviews.chracteristic_id wasn't indexed!

  EXPLAIN ANALYZE SELECT c.id, c.name, AVG(cr.value) AS average
  FROM characteristics c
  JOIN characteristic_reviews cr ON c.id = cr.characteristic_id
  WHERE c.product_id = 31139
  GROUP BY c.id, c.name
  ORDER BY c.id ASC;

  QUERY PLAN
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 Sort  (cost=46.19..46.20 rows=4 width=42) (actual time=17.315..17.318 rows=1 loops=1)
   Sort Key: c.id
   Sort Method: quicksort  Memory: 25kB
   ->  HashAggregate  (cost=46.10..46.15 rows=4 width=42) (actual time=17.281..17.284 rows=1 loops=1)
         Group Key: c.id
         Batches: 1  Memory Usage: 24kB
         ->  Nested Loop  (cost=0.87..45.99 rows=23 width=12) (actual time=17.242..17.256 rows=5 loops=1)
               ->  Index Scan using characteristics_product_id_idx on characteristics c  (cost=0.43..8.50 rows=4 width=10) (actual time=3.040..3.041 rows=1 loops=1)
                     Index Cond: (product_id = 31139)
               ->  Index Scan using characteristic_reviews_characteristic_id_idx on characteristic_reviews cr  (cost=0.44..9.03 rows=34 width=10) (actual time=14.191..14.199 rows=5 loops=1)
                     Index Cond: (characteristic_id = c.id)
 Planning Time: 0.816 ms
 Execution Time: 17.408 ms
*/
