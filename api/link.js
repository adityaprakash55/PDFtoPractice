export default function handler(req, res) {
    const routes = {
        "KyviRDXC": process.env.LINK_JEE_MAIN || "https://cutt.ly/KyviRDXC",
        "IyviR0vt": process.env.LINK_JEE_MAIN_ADV || "https://cutt.ly/IyviR0vt",
        "EyviTynh": process.env.LINK_QUIZRR_BITSAT || "https://cutt.ly/EyviTynh",
        "yyviThvt": process.env.LINK_NEET || "https://cutt.ly/yyviThvt"
    };

    res.status(200).json(routes);
}