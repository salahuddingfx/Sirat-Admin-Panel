import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import { fetchProducts, deleteProduct, createProduct, updateProduct } from "../../../lib/api/queries";
import { Button, Card, SectionHeader, Badge } from "../../../components/ui";
import { triggerAdminToast } from "../../../components/ui/AdminToast";
import { triggerAdminConfirm } from "../../../components/ui/AdminConfirm";
import "./ProductsPage.css";

export function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadProducts = async () => {
    try {
      const response = await fetchProducts();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    triggerAdminConfirm("Are you sure you want to delete this product?", async () => {
      try {
        const response = await deleteProduct(id);
        if (response.success) {
          loadProducts();
          triggerAdminToast("Product deleted successfully", "success");
        }
      } catch (err) {
        console.error("Failed to delete product:", err);
        triggerAdminToast("Failed to delete product", "error");
      }
    });
  };

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="products-page">
      <SectionHeader
        eyebrow="Inventory"
        title="Product Catalog"
        description="Manage your drops, track stock levels, and update pricing."
      >
        <Button onClick={() => { setEditingProduct(null); setShowModal(true); }}>
          <Plus size={18} /> Add Product
        </Button>
      </SectionHeader>

      <div className="products-grid">
        {products?.map((product) => (
          <Card key={product._id} className="admin-product-card">
            <div className="product-image">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} />
              ) : (
                <div className="image-placeholder"><ImageIcon size={40} /></div>
              )}
              <Badge variant={product.status === 'Live' ? 'success' : 'warning'} className="status-badge">
                {product.status}
              </Badge>
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="category">{product.category}</p>
              <div className="price-row">
                <span className="price-container">
                  {product.oldPrice && product.oldPrice > product.price && (
                    <span className="original-price" style={{ textDecoration: "line-through", color: "var(--color-text-muted)", marginRight: "8px", fontSize: "0.85em" }}>
                      ৳{product.oldPrice}
                    </span>
                  )}
                  <span className="price">৳{product.price}</span>
                </span>
                <span className="stock">{product.stock} in stock</span>
              </div>
              <div className="actions">
                <Button variant="ghost" onClick={() => { setEditingProduct(product); setShowModal(true); }}>
                  <Edit2 size={16} />
                </Button>
                <Button variant="ghost" className="delete-btn" onClick={() => handleDelete(product._id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showModal && (
        <ProductModal 
          product={editingProduct} 
          onClose={() => setShowModal(false)} 
          onRefresh={loadProducts} 
        />
      )}
    </div>
  );
}

function ProductModal({ product, onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    oldPrice: product?.oldPrice || "",
    costPrice: product?.costPrice || "",
    category: product?.category || "",
    stock: product?.stock || "",
    status: product?.status || "Live"
  });
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        data.append("images", images[i]);
      }
    }

    try {
      let response;
      if (product) {
        response = await updateProduct(product._id, data);
        if (response.success) triggerAdminToast("Product updated", "success");
      } else {
        response = await createProduct(data);
        if (response.success) triggerAdminToast("New product created", "success");
      }

      if (response.success) {
        onRefresh();
        onClose();
      }
    } catch (err) {
      console.error("Submission error:", err);
      triggerAdminToast("Failed to save product", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{product ? "Edit Product" : "Add New Product"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input 
              type="text" 
              required 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Selling Price (৳)</label>
              <input 
                type="number" 
                required 
                value={formData.price} 
                onChange={e => setFormData({...formData, price: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Original Price (৳)</label>
              <input 
                type="number" 
                value={formData.oldPrice} 
                onChange={e => setFormData({...formData, oldPrice: e.target.value})} 
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              required 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <input 
                type="text" 
                required 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input 
                type="number" 
                required 
                value={formData.stock} 
                onChange={e => setFormData({...formData, stock: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Cost Price (৳)</label>
              <input 
                type="number" 
                value={formData.costPrice} 
                onChange={e => setFormData({...formData, costPrice: e.target.value})} 
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="Live">Live</option>
                <option value="Alert">Alert</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Images</label>
            <input 
              type="file" 
              multiple 
              onChange={e => setImages(e.target.files)} 
            />
          </div>
          <div className="modal-actions">
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : (product ? "Update Product" : "Create Product")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
