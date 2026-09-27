import os
from typing import Any

import requests
import streamlit as st


st.set_page_config(page_title="KarigarConnect", page_icon="K", layout="wide")

try:
    configured_api_url = st.secrets.get("API_URL", "")
except (FileNotFoundError, AttributeError):
    configured_api_url = ""
API_URL = (configured_api_url or os.getenv("KARIGARCONNECT_API") or "http://localhost:5000/api/v1").rstrip("/")

st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap');
    :root { --forest: #24483d; --clay: #b85c3d; --paper: #f7f4ed; --ink: #252c28; }
    html, body, [class*="css"] { font-family: 'DM Sans', sans-serif; color: var(--ink); }
    h1, h2, h3 { font-family: 'Playfair Display', serif !important; color: var(--forest); }
    [data-testid="stAppViewContainer"] { background: radial-gradient(ellipse at 92% 0%, #e6eee5 0, transparent 32%), var(--paper); }
    [data-testid="stSidebar"] { background: #24483d; }
    [data-testid="stSidebar"] * { color: #fff !important; }
    [data-testid="stSidebar"] [data-baseweb="select"] * { color: #202722 !important; }
    .eyebrow { color: var(--clay); font-size: .75rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
    div.stButton > button[kind="primary"] { background: var(--clay); border-color: var(--clay); }
    </style>
    """,
    unsafe_allow_html=True,
)

for key, default in {"token": "", "user": None, "cart": {}, "selected_product": None}.items():
    if key not in st.session_state:
        st.session_state[key] = default


class APIError(RuntimeError):
    pass


def api(method: str, path: str, *, params: dict | None = None, body: dict | None = None, files: dict | None = None) -> Any:
    headers = {"Authorization": f"Bearer {st.session_state.token}"} if st.session_state.token else {}
    try:
        response = requests.request(
            method,
            f"{API_URL}/{path.lstrip('/')}",
            params=params,
            json=body if files is None else None,
            files=files,
            headers=headers,
            timeout=30,
        )
    except requests.RequestException as error:
        raise APIError(f"Could not reach the API at {API_URL}. {error}") from error
    try:
        payload = response.json()
    except ValueError:
        payload = {}
    if not response.ok:
        message = payload.get("message") or payload.get("error") or response.text or f"HTTP {response.status_code}"
        raise APIError(str(message))
    return payload.get("data", payload)


def list_from(value: Any, *keys: str) -> list:
    if isinstance(value, list):
        return value
    if isinstance(value, dict):
        for key in keys:
            if isinstance(value.get(key), list):
                return value[key]
    return []


def money(value: Any) -> str:
    try:
        return f"₹{float(value or 0):,.0f}"
    except (TypeError, ValueError):
        return "₹0"


def show_error(error: Exception) -> None:
    st.error(str(error))


def require_user(*roles: str) -> bool:
    user = st.session_state.user
    if not user:
        st.info("Sign in to use this area.")
        return False
    if roles and user.get("role") not in roles:
        st.warning("This area is not available for your account role.")
        return False
    return True


def page_marketplace() -> None:
    st.markdown('<p class="eyebrow">The marketplace</p>', unsafe_allow_html=True)
    st.title("Find your next heirloom.")
    st.caption("Handmade work from independent artisans, rooted in India's craft traditions.")
    try:
        categories = list_from(api("GET", "/categories"), "categories")
    except APIError:
        categories = []
    category_options = {"All categories": ""}
    category_options.update({item.get("name", "Category"): item.get("_id", "") for item in categories})
    with st.form("market-filters"):
        search_col, category_col, price_col, submit_col = st.columns([3, 2, 2, 1])
        search = search_col.text_input("Search", placeholder="Craft, material, artisan or place")
        category = category_col.selectbox("Category", list(category_options))
        max_price = price_col.number_input("Maximum price (₹)", min_value=0, value=0, step=500)
        submit_col.form_submit_button("Search", type="primary", width="stretch")
    params = {"limit": 24, "page": 1}
    if search.strip():
        params["search"] = search.strip()
    if category_options.get(category):
        params["category"] = category_options[category]
    if max_price:
        params["maxPrice"] = max_price
    try:
        response = api("GET", "/search/products" if search.strip() else "/products", params=params)
        products = list_from(response, "products", "data")
        if not products and isinstance(response, dict) and isinstance(response.get("items"), list):
            products = response["items"]
    except APIError as error:
        show_error(error)
        return
    if not products:
        st.info("No products found. Try a different search or filter.")
        return
    cols = st.columns(3)
    for index, product in enumerate(products):
        with cols[index % 3]:
            with st.container(border=True):
                images = product.get("images") or []
                image_url = product.get("thumbnail") or (images[0].get("url") if images and isinstance(images[0], dict) else None)
                if image_url:
                    st.image(image_url, width="stretch")
                st.markdown(f"**{product.get('title', 'Handcrafted piece')}**")
                artisan = product.get("artisanId") or {}
                st.caption(f"{(product.get('categoryId') or {}).get('name', 'Craft')} · {artisan.get('name', 'Independent artisan')}")
                st.write(money(product.get("price")))
                if st.button("View piece", key=f"view-{product.get('_id', index)}", width="stretch"):
                    st.session_state.selected_product = product.get("_id")
                    st.session_state.page = "Product"
                    st.rerun()


def page_product() -> None:
    product_id = st.session_state.get("selected_product")
    if not product_id:
        st.info("Choose a piece from the marketplace first.")
        return
    try:
        product = api("GET", f"/products/{product_id}")
        if isinstance(product, dict) and "product" in product:
            product = product["product"]
    except APIError as error:
        show_error(error)
        return
    images = product.get("images") or []
    left, right = st.columns([1, 1])
    with left:
        image_url = product.get("thumbnail") or (images[0].get("url") if images and isinstance(images[0], dict) else None)
        if image_url:
            st.image(image_url, width="stretch")
    with right:
        st.markdown('<p class="eyebrow">Handmade, with a story</p>', unsafe_allow_html=True)
        st.title(product.get("title", "Handcrafted piece"))
        st.subheader(money(product.get("price")))
        st.write(product.get("description", ""))
        st.caption(f"{(product.get('categoryId') or {}).get('name', 'Craft')} · {(product.get('artisanId') or {}).get('name', 'Independent artisan')}")
        if st.button("Add to basket", type="primary"):
            item = st.session_state.cart.setdefault(product_id, {"product": product, "quantity": 0})
            item["quantity"] += 1
            st.success("Added to your basket.")
        if st.session_state.user:
            if st.button("Save to wishlist"):
                try:
                    api("POST", f"/wishlist/{product_id}")
                    st.success("Saved to your wishlist.")
                except APIError as error:
                    show_error(error)


def page_account() -> None:
    if st.session_state.user:
        user = st.session_state.user
        st.title(f"Welcome, {user.get('name', 'maker')}.")
        st.write(f"Signed in as {user.get('email', '')} · {user.get('role', 'buyer').title()}")
        if st.button("Sign out"):
            try:
                api("POST", "/auth/logout")
            except APIError:
                pass
            st.session_state.token = ""
            st.session_state.user = None
            st.rerun()
        return
    st.markdown('<p class="eyebrow">Your KarigarConnect account</p>', unsafe_allow_html=True)
    st.title("Sign in or join the community.")
    login_tab, register_tab = st.tabs(["Sign in", "Create account"])
    with login_tab:
        with st.form("login-form"):
            email = st.text_input("Email")
            password = st.text_input("Password", type="password")
            submitted = st.form_submit_button("Sign in", type="primary")
        if submitted:
            try:
                data = api("POST", "/auth/login", body={"email": email, "password": password})
                st.session_state.token = data.get("accessToken", "")
                st.session_state.user = data.get("user")
                st.rerun()
            except APIError as error:
                show_error(error)
    with register_tab:
        with st.form("register-form"):
            name = st.text_input("Full name")
            new_email = st.text_input("Email address")
            phone = st.text_input("Phone (optional)")
            new_password = st.text_input("Password", type="password")
            role = st.selectbox("I am joining as", ["buyer", "artisan"])
            submitted = st.form_submit_button("Create account", type="primary")
        if submitted:
            try:
                data = api("POST", "/auth/register", body={"name": name, "email": new_email, "phone": phone, "password": new_password, "role": role})
                st.session_state.token = data.get("accessToken", "")
                st.session_state.user = data.get("user")
                st.rerun()
            except APIError as error:
                show_error(error)


def page_basket() -> None:
    st.markdown('<p class="eyebrow">Your space</p>', unsafe_allow_html=True)
    st.title("Your basket")
    cart = st.session_state.cart
    if not cart:
        st.info("Your basket is waiting for something made with meaning.")
        return
    total = 0
    for product_id, item in list(cart.items()):
        product = item["product"]
        cols = st.columns([4, 1, 1, 1])
        cols[0].write(product.get("title", "Handcrafted piece"))
        item["quantity"] = cols[1].number_input("Qty", min_value=1, value=item["quantity"], key=f"qty-{product_id}")
        price = float(product.get("price", 0) or 0) * item["quantity"]
        total += price
        cols[2].write(money(price))
        if cols[3].button("Remove", key=f"remove-{product_id}"):
            del cart[product_id]
            st.rerun()
    st.divider()
    st.subheader(f"Subtotal: {money(total)}")
    if not require_user():
        st.caption("Sign in before placing an order.")
        return
    address = st.text_area("Shipping address")
    if st.button("Place order", type="primary", disabled=not address.strip()):
        try:
            api("POST", "/orders", body={"items": [{"productId": product_id, "quantity": item["quantity"]} for product_id, item in cart.items()], "quickDelivery": False, "shippingAddress": {"address": address}})
            st.session_state.cart = {}
            st.success("Order placed. Visit My orders to track it.")
        except APIError as error:
            show_error(error)


def page_orders() -> None:
    st.title("My orders")
    if not require_user():
        return
    try:
        orders = list_from(api("GET", "/orders/my-orders"), "orders")
    except APIError as error:
        show_error(error)
        return
    if not orders:
        st.info("No orders to show yet.")
        return
    for order in orders:
        with st.container(border=True):
            st.write(f"Order #{str(order.get('_id', ''))[-7:]} · {order.get('orderStatus', 'Processing')}")
            st.write(money(order.get("totalAmount")))


def page_wishlist() -> None:
    st.title("Saved pieces")
    if not require_user():
        return
    try:
        products = list_from(api("GET", "/wishlist"), "products")
    except APIError as error:
        show_error(error)
        return
    if not products:
        st.info("No saved pieces yet.")
        return
    for product in products:
        with st.container(border=True):
            st.write(f"**{product.get('title', 'Handcrafted piece')}** · {money(product.get('price'))}")


def page_artisan() -> None:
    if not require_user("artisan", "admin"):
        return
    st.markdown('<p class="eyebrow">Artisan studio</p>', unsafe_allow_html=True)
    st.title("Your studio")
    try:
        stats = api("GET", "/artisans/dashboard")
        stats = stats if isinstance(stats, dict) else {}
        metric_cols = st.columns(4)
        for col, label, key in zip(metric_cols, ["Products", "Published", "Orders", "Sales"], ["products", "publishedProducts", "orders", "sales"]):
            col.metric(label, money(stats.get(key)) if key == "sales" else stats.get(key, 0))
    except APIError as error:
        show_error(error)
    catalog_tab, products_tab, orders_tab = st.tabs(["AI catalog", "My products", "Orders"])
    with catalog_tab:
        image = st.file_uploader("Product image", type=["jpg", "jpeg", "png", "webp"])
        if image and st.button("Generate catalog draft", type="primary"):
            try:
                draft = api("POST", "/ai/catalog", files={"image": (image.name, image.getvalue(), image.type)})
                product = draft.get("product", draft) if isinstance(draft, dict) else {}
                st.text_input("Suggested title", value=product.get("title", ""), key="draft-title")
                st.text_area("Suggested description", value=product.get("description", ""), key="draft-description")
                st.write(f"Suggested price: {money(product.get('price') or (product.get('aiSuggestedPrice') or {}).get('recommended'))}")
                st.info("Review AI suggestions before publishing. Save this draft through My products when ready.")
            except APIError as error:
                show_error(error)
    with products_tab:
        try:
            products = list_from(api("GET", "/products/my-products"), "products")
            if products:
                st.dataframe([{"Title": p.get("title"), "Price": p.get("price"), "Status": p.get("status")} for p in products], width="stretch", hide_index=True)
            else:
                st.info("No products in your catalog yet.")
        except APIError as error:
            show_error(error)
        with st.expander("Create a product listing"):
            with st.form("new-product"):
                title = st.text_input("Title")
                description = st.text_area("Description")
                price = st.number_input("Price (₹)", min_value=0.0, step=100.0)
                stock = st.number_input("Stock", min_value=0, value=1, step=1)
                submitted = st.form_submit_button("Save product")
            if submitted:
                try:
                    api("POST", "/products", body={"title": title, "description": description, "price": price, "stock": stock})
                    st.success("Product saved.")
                    st.rerun()
                except APIError as error:
                    show_error(error)
    with orders_tab:
        try:
            orders = list_from(api("GET", "/artisans/orders"), "orders")
            if orders:
                st.dataframe(orders, width="stretch", hide_index=True)
            else:
                st.info("No artisan orders yet.")
        except APIError as error:
            show_error(error)


def page_admin() -> None:
    if not require_user("admin"):
        return
    st.markdown('<p class="eyebrow">Platform operations</p>', unsafe_allow_html=True)
    st.title("Admin dashboard")
    try:
        dashboard = api("GET", "/admin/dashboard")
        dashboard = dashboard if isinstance(dashboard, dict) else {}
        cols = st.columns(4)
        for col, label, key in zip(cols, ["Users", "Artisans", "Products", "Revenue"], ["users", "artisans", "products", "revenue"]):
            col.metric(label, money(dashboard.get(key)) if key == "revenue" else dashboard.get(key, 0))
        for title, path in [("Products", "/admin/products"), ("Orders", "/admin/orders")]:
            st.subheader(title)
            records = list_from(api("GET", path), title.lower())
            if records:
                st.dataframe(records, width="stretch", hide_index=True)
            else:
                st.caption(f"No {title.lower()} to review.")
    except APIError as error:
        show_error(error)


def page_notifications() -> None:
    st.title("Notifications")
    if not require_user():
        return
    try:
        notifications = list_from(api("GET", "/notifications"), "notifications")
    except APIError as error:
        show_error(error)
        return
    if not notifications:
        st.info("You're all caught up.")
    for notification in notifications:
        with st.container(border=True):
            st.write(f"**{notification.get('title', 'New update')}**")
            st.write(notification.get("message", ""))


def main() -> None:
    user = st.session_state.user
    st.sidebar.markdown("# KarigarConnect")
    st.sidebar.caption("Craft · Culture · Markets")
    pages = ["Marketplace", "Product", "Basket", "My orders", "Wishlist", "Notifications", "Account", "Artisan studio", "Admin"]
    selected = st.sidebar.radio("Navigate", pages, key="page")
    if user:
        st.sidebar.caption(f"{user.get('name', 'Member')} · {user.get('role', 'buyer').title()}")
    st.sidebar.caption(f"API: {API_URL}")
    if selected == "Marketplace":
        page_marketplace()
    elif selected == "Product":
        page_product()
    elif selected == "Basket":
        page_basket()
    elif selected == "My orders":
        page_orders()
    elif selected == "Wishlist":
        page_wishlist()
    elif selected == "Notifications":
        page_notifications()
    elif selected == "Account":
        page_account()
    elif selected == "Artisan studio":
        page_artisan()
    elif selected == "Admin":
        page_admin()


main()