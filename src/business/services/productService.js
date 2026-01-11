const productRepository = require('../../data/repositories/productRepository');
const productValidator = require('../validators/productValidator');

class ProductService {
    async getAllProducts(category) {
        const products = await productRepository.findAll(category);
        
        // คำนวณยอดเงินรวม (แก้ NaN ตรงนี้)
        const totalValue = products.reduce((sum, item) => {
            return sum + (item.price * item.stock);
        }, 0);

        return { products, totalValue };
    }

    async getProductById(id) {
        return await productRepository.findById(id);
    }

    async createProduct(data) {
        productValidator.validateProductData(data);
        productValidator.validatePrice(data.price);
        return await productRepository.create(data);
    }

    async updateProduct(id, data) {
        productValidator.validateProductData(data);
        return await productRepository.update(id, data);
    }

    async deleteProduct(id) {
        const product = await productRepository.findById(id);
        if (!product) throw new Error('Product not found');
        if (product.stock > 0) throw new Error('Cannot delete product with stock > 0');
        return await productRepository.delete(id);
    }
}

module.exports = new ProductService();