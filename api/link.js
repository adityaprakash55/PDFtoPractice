export default function handler(req, res) {
    const routes = {
        // Direct Verified MG27P89 Referral Destinations
        "JEE_MAIN": "https://www.quizrr.in/jee-main-test-series/?amount_to_pay=5800&discount_value=6200&coupon=MG27P89",
        "JEE_MAIN_ADV": "https://www.quizrr.in/jee-main-advanced-test-series/?amount_to_pay=8490&discount_value=12500&coupon=MG27P89",
        "QUIZRR_PASS": "https://quizrr.in/pass/?coupon=MG27P89",
        "NEET": "https://www.quizrr.in/neet-test-series/?amount_to_pay=5500&discount_value=6500&coupon=MG27P89",

        // Map shortcodes directly to MG27P89 URLs
        "KyviRDXC": "https://www.quizrr.in/jee-main-test-series/?amount_to_pay=5800&discount_value=6200&coupon=MG27P89",
        "IyviR0vt": "https://www.quizrr.in/jee-main-advanced-test-series/?amount_to_pay=8490&discount_value=12500&coupon=MG27P89",
        "EyviTynh": "https://quizrr.in/pass/?coupon=MG27P89",
        "yyviThvt": "https://www.quizrr.in/neet-test-series/?amount_to_pay=5500&discount_value=6500&coupon=MG27P89",
        "eyeg4S1a": "https://www.quizrr.in/jee-main-test-series/?amount_to_pay=5800&discount_value=6200&coupon=MG27P89",
        "dyeg4CoP": "https://www.quizrr.in/jee-main-advanced-test-series/?amount_to_pay=8490&discount_value=12500&coupon=MG27P89",
        "Hyeg47ov": "https://quizrr.in/pass/?coupon=MG27P89",
        "FytpQW17": "https://www.quizrr.in/neet-test-series/?amount_to_pay=5500&discount_value=6500&coupon=MG27P89"
    };

    const target = req.query?.code || req.query?.id;
    if (target && routes[target]) {
        return res.redirect(307, routes[target]);
    }

    res.status(200).json(routes);
}