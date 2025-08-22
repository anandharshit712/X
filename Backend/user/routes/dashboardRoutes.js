const express = require("express");
const router = express.Router();
const { pools } = require("../config/database");

// Get the specific database pools we need
const offerwallDB = pools.offerwall;
const dashboardDB = pools.dashboard;

/**
 * @route GET /api/dashboard/overview
 * @description Get comprehensive dashboard data including revenue, conversions, user engagement, and app performance
 * @access Private
 */
router.get("/overview", async (req, res) => {
  try {
    // Get current date and 30 days ago date for default view
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

    // 1. Get Revenue Overview from service_offerwall
    const revenueOverview = await offerwallDB.query(
      `
            SELECT 
                SUM(rev.amount) as total_revenue,
                COUNT(DISTINCT rev.offer_id) as total_active_offers,
                COUNT(DISTINCT rev.user_id) as total_users,
                AVG(rev.amount) as average_revenue_per_offer
            FROM service_offerwall.offerwall_revenue AS rev
            WHERE rev.created_at >= $1
        `,
      [thirtyDaysAgo]
    );

    // 2. Get Conversion Metrics
    const conversionMetrics = await offerwallDB.query(
      `
            SELECT 
                COUNT(*) as total_conversions,
                COUNT(DISTINCT user_id) as unique_users,
                AVG(payout) as average_payout,
                SUM(payout) as total_payout
            FROM service_offerwall.offerwall_conversions
            WHERE created_at >= $1
        `,
      [thirtyDaysAgo]
    );

    // 3. Get Engagement Metrics (Clicks and CTR)
    const engagementMetrics = await offerwallDB.query(
      `
            SELECT 
                COUNT(*) as total_clicks,
                COUNT(DISTINCT user_id) as unique_clickers,
                COUNT(DISTINCT offer_id) as offers_clicked
            FROM service_offerwall.offerwall_clicks
            WHERE created_at >= $1
        `,
      [thirtyDaysAgo]
    );

    // 4. Get Daily Revenue and Conversion Trends
    const dailyTrends = await offerwallDB.query(
      `
            WITH daily_metrics AS (
                SELECT 
                    DATE(rev.created_at) as date,
                    SUM(rev.amount) as revenue,
                    COUNT(DISTINCT oc.id) as conversions,
                    COUNT(DISTINCT ocl.id) as clicks
                FROM service_offerwall.offerwall_revenue AS rev
                LEFT JOIN service_offerwall.offerwall_conversions oc 
                    ON rev.conversion_id = oc.id
                LEFT JOIN service_offerwall.offerwall_clicks ocl 
                    ON oc.click_id = ocl.id
                WHERE rev.created_at >= $1
                GROUP BY DATE(or.created_at)
                ORDER BY date
            )
            SELECT 
                date,
                revenue,
                conversions,
                clicks,
                CASE 
                    WHEN clicks > 0 THEN (conversions::float / clicks * 100)
                    ELSE 0 
                END as conversion_rate
            FROM daily_metrics
        `,
      [thirtyDaysAgo]
    );

    // 5. Get Top Performing Apps with Details
    const topApps = await offerwallDB.query(
      `
            SELECT 
                oa.app_name,
                oa.app_id,
                COUNT(DISTINCT oc.id) as conversion_count,
                COUNT(DISTINCT oc.user_id) as unique_users,
                SUM(rev.amount) as total_revenue,
                AVG(rev.amount) as avg_revenue_per_conversion,
                COUNT(DISTINCT ocl.id) as click_count,
                CASE 
                    WHEN COUNT(DISTINCT ocl.id) > 0 
                    THEN (COUNT(DISTINCT oc.id)::float / COUNT(DISTINCT ocl.id) * 100)
                    ELSE 0 
                END as conversion_rate
            FROM service_offerwall.offerwall_app oa
            LEFT JOIN service_offerwall.offerwall_conversions oc 
                ON oa.app_id = oc.app_id
            LEFT JOIN service_offerwall.offerwall_revenue AS rev 
                ON oc.conversion_id = rev.conversion_id
            LEFT JOIN service_offerwall.offerwall_clicks ocl 
                ON oc.click_id = ocl.id
            WHERE oc.created_at >= $1
            GROUP BY oa.app_id, oa.app_name
            ORDER BY total_revenue DESC
            LIMIT 5
        `,
      [thirtyDaysAgo]
    );

    // 6. Get Payment Status Summary
    const paymentStatus = await offerwallDB.query(
      `
            SELECT 
                ops.status,
                COUNT(*) as count,
                SUM(op.amount) as total_amount,
                MIN(op.created_at) as earliest_payment,
                MAX(op.created_at) as latest_payment
            FROM service_offerwall.offerwall_payments op
            JOIN service_offerwall.offerwall_payments_status ops 
                ON op.payment_id = ops.payment_id
            WHERE op.created_at >= $1
            GROUP BY ops.status
        `,
      [thirtyDaysAgo]
    );

    // 7. Get Recent Activity from service_dashboard
    const recentActivity = await dashboardDB.query(
      `
            SELECT 
                dl.activity_type,
                dl.timestamp,
                dl.user_id,
                dd.dashboard_type
            FROM service_dashboard.dashboard_login dl
            JOIN service_dashboard.dashboard_details dd 
                ON dl.user_id = dd.user_id
            WHERE dl.timestamp >= $1
            ORDER BY dl.timestamp DESC
            LIMIT 10
        `,
      [thirtyDaysAgo]
    );

    // Prepare and send response
    res.json({
      overview: {
        revenue: {
          total: revenueOverview.rows[0]?.total_revenue || 0,
          averagePerOffer:
            revenueOverview.rows[0]?.average_revenue_per_offer || 0,
          activeOffers: revenueOverview.rows[0]?.total_active_offers || 0,
          totalUsers: revenueOverview.rows[0]?.total_users || 0,
        },
        conversions: {
          total: conversionMetrics.rows[0]?.total_conversions || 0,
          uniqueUsers: conversionMetrics.rows[0]?.unique_users || 0,
          averagePayout: conversionMetrics.rows[0]?.average_payout || 0,
          totalPayout: conversionMetrics.rows[0]?.total_payout || 0,
        },
        engagement: {
          totalClicks: engagementMetrics.rows[0]?.total_clicks || 0,
          uniqueClickers: engagementMetrics.rows[0]?.unique_clickers || 0,
          offersClicked: engagementMetrics.rows[0]?.offers_clicked || 0,
          conversionRate: engagementMetrics.rows[0]?.total_clicks
            ? (
                (conversionMetrics.rows[0].total_conversions /
                  engagementMetrics.rows[0].total_clicks) *
                100
              ).toFixed(2)
            : 0,
        },
      },
      trends: {
        daily: dailyTrends.rows.map((day) => ({
          ...day,
          revenue: parseFloat(day.revenue) || 0,
          conversion_rate: parseFloat(day.conversion_rate).toFixed(2),
        })),
      },
      topApps: topApps.rows.map((app) => ({
        ...app,
        total_revenue: parseFloat(app.total_revenue) || 0,
        avg_revenue_per_conversion:
          parseFloat(app.avg_revenue_per_conversion) || 0,
        conversion_rate: parseFloat(app.conversion_rate).toFixed(2),
      })),
      payments: paymentStatus.rows.map((status) => ({
        ...status,
        total_amount: parseFloat(status.total_amount) || 0,
      })),
      recentActivity: recentActivity.rows,
    });
  } catch (err) {
    console.error("Dashboard Error:", err.message);
    res.status(500).json({
      error: "Server error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

module.exports = router;
