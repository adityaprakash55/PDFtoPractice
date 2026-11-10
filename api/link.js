export default function handler(req, res) {
    const routes = {
        "yyQbJedZ": process.env.LINK_JEE_MAIN || "https://cutt.ly/yyQbJedZ",
        "eyQbJbu4": process.env.LINK_JEE_MAIN_ADV || "https://cutt.ly/eyQbJbu4",
        "2yQbJCV3": process.env.LINK_QUIZRR_BITSAT || "https://cutt.ly/2yQbJCV3",
        "ZyQbKtSW": process.env.LINK_NEET || "https://cutt.ly/ZyQbKtSW"
    };

    res.status(200).json(routes);
}