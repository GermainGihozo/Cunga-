import { query as dbQuery } from '../config/database.js'

const getProductById = async (id, tenantId) => {
  const results = await dbQuery(
    `SELECT p.*, b.name AS branch_name, c.name AS category_name
     FROM products p
     LEFT JOIN branches b ON p.branch_id = b.id
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.id = ? AND p.tenant_id = ?`,
    [id, tenantId]
  )
  return results[0] || null
}

export const getProducts = async (filters) => {
  const { tenantId, branchId, page, limit, search, categoryId, status, sortBy, sortOrder, lowStock } = filters
  const offset = (page - 1) * limit

  let conditions = ['p.tenant_id = ?']
  const params = [tenantId]

  if (branchId)    { conditions.push('p.branch_id = ?');   params.push(branchId) }
  if (search)      { conditions.push('(p.name LIKE ? OR p.sku LIKE ?)'); params.push(`%${search}%`, `%${search}%`) }
  if (categoryId)  { conditions.push('p.category_id = ?'); params.push(categoryId) }
  if (status)      { conditions.push('p.status = ?');      params.push(status) }
  if (lowStock)    { conditions.push('p.quantity <= p.min_stock_level') }

  const where = conditions.join(' AND ')
  const [{ total }] = await dbQuery(`SELECT COUNT(*) AS total FROM products p WHERE ${where}`, params)

  const validSort = ['name','sku','quantity','cost_price','selling_price','created_at']
  const col   = validSort.includes(sortBy) ? sortBy : 'created_at'
  const order = sortOrder?.toLowerCase() === 'asc' ? 'ASC' : 'DESC'

  const data = await dbQuery(
    `SELECT p.*, b.name AS branch_name, c.name AS category_name
     FROM products p
     LEFT JOIN branches b ON p.branch_id = b.id
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE ${where}
     ORDER BY p.${col} ${order}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  )
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export { getProductById }

export const createProduct = async (productData) => {
  const { tenantId, branchId, name, description, sku, categoryId,
          costPrice, sellingPrice, quantity, minStockLevel, imageUrl, status = 'active' } = productData

  if (!name || costPrice == null || sellingPrice == null || quantity == null)
    throw new Error('Missing required fields: name, costPrice, sellingPrice, quantity')

  const result = await dbQuery(
    `INSERT INTO products
       (tenant_id, branch_id, name, description, sku, category_id,
        cost_price, selling_price, quantity, min_stock_level, image_url, status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [tenantId, branchId, name, description, sku, categoryId,
     costPrice, sellingPrice, quantity, minStockLevel || 10, imageUrl, status]
  )
  return getProductById(result.insertId, tenantId)
}

export const updateProduct = async (id, tenantId, productData) => {
  const fields = ['name','description','sku','categoryId','costPrice','sellingPrice','quantity','minStockLevel','imageUrl','status']
  const colMap = { categoryId:'category_id', costPrice:'cost_price', sellingPrice:'selling_price', minStockLevel:'min_stock_level', imageUrl:'image_url' }
  const sets = [], params = []

  for (const f of fields) {
    if (productData[f] !== undefined) {
      sets.push(`${colMap[f] || f} = ?`)
      params.push(productData[f])
    }
  }
  if (sets.length === 0) throw new Error('No fields to update')

  await dbQuery(`UPDATE products SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`, [...params, id, tenantId])
  return getProductById(id, tenantId)
}

export const deleteProduct = async (id, tenantId) => {
  await dbQuery('DELETE FROM products WHERE id = ? AND tenant_id = ?', [id, tenantId])
  return true
}

export const updateStock = async (id, tenantId, quantity, type) => {
  const op = type === 'add' ? '+' : '-'
  await dbQuery(`UPDATE products SET quantity = quantity ${op} ? WHERE id = ? AND tenant_id = ?`, [quantity, id, tenantId])
  return getProductById(id, tenantId)
}

export const getCategories = async (tenantId) =>
  dbQuery('SELECT * FROM categories WHERE tenant_id = ? ORDER BY name', [tenantId])

export const createCategory = async (tenantId, { name, description }) => {
  const result = await dbQuery(
    'INSERT INTO categories (tenant_id, name, description) VALUES (?,?,?)',
    [tenantId, name, description]
  )
  const [cat] = await dbQuery('SELECT * FROM categories WHERE id = ?', [result.insertId])
  return cat
}

export default { getProducts, getProductById, createProduct, updateProduct, deleteProduct, updateStock, getCategories, createCategory }
