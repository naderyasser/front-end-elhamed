import { render, screen } from "@testing-library/react";
import ProductsIndexPage from "@/app/(shop)/products/page";

describe("ProductsIndexPage", () => {
    it("filters products by category", () => {
        render(<ProductsIndexPage searchParams={{ category: "العناية بالبشرة" }} />);

        expect(screen.getByText("غسول وجه لطيف")).toBeInTheDocument();
        expect(screen.queryByText("الحامد زيت الشعر المتطور")).not.toBeInTheDocument();
    });

    it("filters out out-of-stock items when stock only is enabled", () => {
        render(<ProductsIndexPage searchParams={{ stock: "1" }} />);

        expect(screen.queryByText("بلسم تغذية عميقة")).not.toBeInTheDocument();
    });

    it("shows empty state when query has no matches", () => {
        render(<ProductsIndexPage searchParams={{ q: "zzzz-not-found" }} />);

        expect(screen.getByText("لا توجد نتائج مطابقة")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "العودة إلى كل المنتجات" })).toBeInTheDocument();
    });
});
