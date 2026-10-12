export default function handler(req, res) {
    const routes = {
        // Direct Verified MG27P89 Referral Destinations
        "JEE_MAIN": process.env.LINK_JEE_MAIN || "https://www.quizrr.in/jee-main-test-series/?amount_to_pay=5800&discount_value=6200&coupon=MG27P89",
        "JEE_MAIN_ADV": process.env.LINK_JEE_MAIN_ADV || "https://www.quizrr.in/jee-main-advanced-test-series/?amount_to_pay=8490&discount_value=12500&coupon=MG27P89",
        "QUIZRR_PASS": process.env.LINK_QUIZRR_BITSAT || "https://quizrr.in/pass/?coupon=MG27P89",
        "NEET": process.env.LINK_NEET || "https://www.quizrr.in/neet-test-series/?amount_to_pay=5500&discount_value=6500&coupon=MG27P89",

        // Map shortcodes directly to MG27P89 URLs
        "KyviRDXC": process.env.LINK_JEE_MAIN || "https://www.quizrr.in/jee-main-test-series/?amount_to_pay=5800&discount_value=6200&coupon=MG27P89",
        "IyviR0vt": process.env.LINK_JEE_MAIN_ADV || "https://www.quizrr.in/jee-main-advanced-test-series/?amount_to_pay=8490&discount_value=12500&coupon=MG27P89",
        "EyviTynh": process.env.LINK_QUIZRR_BITSAT || "https://quizrr.in/pass/?coupon=MG27P89",
        "yyviThvt": process.env.LINK_NEET || "https://www.quizrr.in/neet-test-series/?amount_to_pay=5500&discount_value=6500&coupon=MG27P89",
        "eyeg4S1a": process.env.LINK_JEE_MAIN || "https://www.quizrr.in/jee-main-test-series/?amount_to_pay=5800&discount_value=6200&coupon=MG27P89",
        "dyeg4CoP": process.env.LINK_JEE_MAIN_ADV || "https://www.quizrr.in/jee-main-advanced-test-series/?amount_to_pay=8490&discount_value=12500&coupon=MG27P89",
        "Hyeg47ov": process.env.LINK_QUIZRR_BITSAT || "https://quizrr.in/pass/?coupon=MG27P89",
        "FytpQW17": process.env.LINK_NEET || "https://www.quizrr.in/neet-test-series/?amount_to_pay=5500&discount_value=6500&coupon=MG27P89"
    };

    const target = req.query?.code || req.query?.id;
    if (target && routes[target]) {
        return res.redirect(307, routes[target]);
    }

    res.status(200).json(routes);
}