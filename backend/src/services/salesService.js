import { query as dbQuery } from '../config/database.js'
import { generateReceiptNumber } from '../utils/helpers.js'

const getSaleById = async (id, tenantId) => {
  const [sale] = await dbQuery(
    `SELECT s.*, b.name AS branch_name, u.username AS user_name
     FROM sales s
     LEFT JOIN branches b ON s.branch_id = b.id
     LEFT JOIN users u ON s.user_id = u.id
     WHERE s.id = ? AND s.tenant_id = ?`,
    [id, tenantId]
  )
  if (!sale) return null
  const items = await dbQuery(
    `SELECT si.*, p.name AS product_name, p.sku AS product_sku
     FROM sale_items si LEFT JOIN products p ON si.product_id = p.id WHERE si.sale_id = ?`,
    [id]
  )
  return { ...sale, items }
}

export { getSaleById }

export const getSales = async (filters) => {
  const { tenantId, branchId, page, limit, startDate, endDate, paymentMethod, sortBy, sortOrder } = filters
  const offset = (page - 1) * limit

  let conditions = ['s.tenant_id = ?']
  const params = [tenantId]

  if (branchId)       { conditions.push('s.branch_id = ?');       params.push(branchId) }
  if (startDate)      { conditions.push('DATE(s.created_at) >= ?'); params.push(startDate) }
  if (endDate)        { conditions.push('DATE(s.created_at) <= ?'); params.push(endDate) }
  if (paymentMethod)  { conditions.push('s.payment_method = ?');   params.push(paymentMethod) }

  const where = conditions.join(' AND ')
  const [{ total }] = await dbQuery(
    `SELECT COUNT(*) AS total FROM sales s WHERE ${where}`, params
  )

  const validSort = ['total_amount','total_profit','created_at','receipt_number']
  const col   = validSort.includes(sortBy) ? sortBy : 'created_at'
  const order = sortOrder?.toLowerCase() === 'asc' ? 'ASC' : 'DESC'

  const data = await dbQuery(
    `SELECT s.*, b.name AS branch_name, u.username AS user_name
     FROM sales s
     LEFT JOIN branches b ON s.branch_id = b.id
     LEFT JOIN users u ON s.user_id = u.id
     WHERE ${where}
     ORDER BY s.${col} ${order}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  )
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export const createSale = async (saleData) => {
  const { tenantId, branchId, userId, items, paymentMethod, customerName, customerPhone } = saleData
  let totalAmount = 0, totalProfit = 0
  const validatedItems = []

  for (const { productId, quantity } of items) {
    const [product] = await dbQuery(
      'SELECT * FROM products WHERE id = ? AND tenant_id = ? AND branch_id = ?',
      [productId, tenantId, branchId]
    )
    if (!product) throw new Error(`Product ${productId} not found`)
    if (product.quantity < quantity) throw new Error(`Insufficient stock for ${product.name}`)

    const unitCost  = product.cost_price
    const unitPrice = product.selling_price
    const totalCost  = unitCost  * quantity
    const totalPrice = unitPrice * quantity
    const profit     = totalPrice - totalCost

    totalAmount += totalPrice
    totalProfit += profit
    validatedItems.push({ productId, productName: product.name, quantity, unitCost, unitPrice, totalCost, totalPrice, profit })

    await dbQuery('UPDATE products SET quantity = quantity - ? WHERE id = ?', [quantity, productId])
  }

  const receiptNumber = generateReceiptNumber()
  const result = await dbQuery(
    `INSERT INTO sales (tenant_id,branch_id,user_id,total_amount,total_profit,payment_method,customer_name,customer_phone,receipt_number)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [tenantId, branchId, userId, totalAmount, totalProfit, paymentMethod, customerName, customerPhone, receiptNumber]
  )
  const saleId = result.insertId

  // Bulk insert items
  for (const item of validatedItems) {
    await dbQuery(
      `INSERT INTO sale_items (sale_id,product_id,product_name,quantity,unit_cost,unit_price,total_cost,total_price,profit)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [saleId, item.productId, item.productName, item.quantity, item.unitCost, item.unitPrice, item.totalCost, item.totalPrice, item.profit]
    )
  }

  await dbQuery(
    'INSERT INTO activity_logs (tenant_id,branch_id,user_id,action,description) VALUES (?,?,?,?,?)',
    [tenantId, branchId, userId, 'sale_created', `Sale created: ${receiptNumber}`]
  )

  return getSaleById(saleId, tenantId)
}

export const getReceipt = async (id, tenantId) => {
  const sale = await getSaleById(id, tenantId)
  if (!sale) return null
  const [business] = await dbQuery('SELECT business_name,contact_email,contact_phone FROM tenants WHERE id = ?', [tenantId])
  const [branch]   = await dbQuery('SELECT name,location,phone FROM branches WHERE id = ?', [sale.branch_id])
  return { sale, business, branch }
}

export const getSalesSummary = async (filters) => {
  const { tenantId, branchId, startDate, endDate } = filters
  let conditions = ['tenant_id = ?']
  const params = [tenantId]

  if (branchId)  { conditions.push('branch_id = ?');        params.push(branchId) }
  if (startDate) { conditions.push('DATE(created_at) >= ?'); params.push(startDate) }
  if (endDate)   { conditions.push('DATE(created_at) <= ?'); params.push(endDate) }

  const where = conditions.join(' AND ')
  const [summary] = await dbQuery(
    `SELECT COUNT(*) AS total_sales,
            COALESCE(SUM(total_amount),0) AS total_revenue,
            COALESCE(SUM(total_profit),0) AS total_profit,
            COALESCE(AVG(total_amount),0) AS average_sale
     FROM sales WHERE ${where}`,
    params
  )
  const paymentBreakdown = await dbQuery(
    `SELECT payment_method, COUNT(*) AS count, COALESCE(SUM(total_amount),0) AS amount
     FROM sales WHERE ${where} GROUP BY payment_method`,
    params
  )
  return { ...summary, paymentBreakdown }
}

export default { getSales, getSaleById, createSale, getReceipt, getSalesSummary }
