
class CartController {
    // [GET] /cart
    show(req, res) {
        
    }

    // [POST] /cart/add
    addToCart(req, res) {
        
    }

    // [PUT] /cart/update
    updateQuantity(req, res) {
        
    }

    // [DELETE] /cart/remove
    removeFromCart(req, res) {
        
    }

    // [DELETE] /cart/clear
    clearCart(req, res) {
        
    }
    
    checkout(req, res) {
        res.render('pages/checkout', { page: { title: 'Thanh toán' } });
    }
}

module.exports = new CartController(); 