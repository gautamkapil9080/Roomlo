const ExpressError = require("./ExpressError");

module.exports = function buildListingSearch(filters) {
    const { searchValue, priceMin, priceMax, sort } = filters;
    const term = typeof searchValue === "string" ? searchValue.trim() : "";
    if (!term) return null;
    if (term.length > 100) throw new ExpressError(400, "Search text must be 100 characters or fewer.");

    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchCondition = {
        $or: ["title", "description", "location", "Country"].map((field) => ({
            [field]: { $regex: escaped, $options: "i" }
        }))
    };
    const priceRange = {};
    for (const [rawValue, operator] of [[priceMin, "$gte"], [priceMax, "$lte"]]) {
        if (rawValue === undefined || rawValue === "") continue;
        const value = Number(rawValue);
        if (!Number.isFinite(value) || value < 0) throw new ExpressError(400, "Price filters must be valid non-negative numbers.");
        priceRange[operator] = value;
    }
    if (priceRange.$gte !== undefined && priceRange.$lte !== undefined && priceRange.$gte > priceRange.$lte) {
        throw new ExpressError(400, "Minimum price must not exceed maximum price.");
    }
    const query = Object.keys(priceRange).length
        ? { $and: [searchCondition, { price: priceRange }] }
        : searchCondition;
    const sortMode = ["price-asc", "price-desc"].includes(sort) ? sort : "relevance";
    const sortSpec = sortMode === "price-asc" ? { price: 1 } : sortMode === "price-desc" ? { price: -1 } : null;

    return { term, query, sort: sortMode, sortSpec };
};
