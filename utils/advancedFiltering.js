const advancedFiltering = async (model, fields, populate) => {
  const reqQuery = { ...fields }
  let query
  let queryStr

  // Loop over removeFields and delete them from reqQuery
  const removeFields = ['sort', 'page', 'limit']
  removeFields.forEach((param) => delete reqQuery[param])

  // Loop over fields and create query string
  const queryFields = Object.keys(reqQuery)
  queryFields.map((field) => {
    let value = reqQuery[field]
    if (typeof value === 'string' && value.includes(',')) {
      if (field === 'createdAt') {
        const dates = value.split(',')
        value = {
          $gte: dates[0],
          $lte: dates[1],
        }
      } else {
        value = { $in: value.split(',') }
      }
    }
    queryStr = {
      ...queryStr,
      [field]: value,
    }
  })
  // Finding resource
  query = model.find(queryStr).collation({ locale: 'tr', strength: 2 })

  // Sort
  if (fields?.sort) {
    query = query.sort(fields.sort)
  } else {
    query = query.sort('-createdAt')
  }

  // Pagination
  const page = parseInt(fields?.page, 10) || 1
  const limit = parseInt(fields?.limit, 10) || 10
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const totalDocs = await model.countDocuments(queryStr)
  const totalPages = Math.ceil(totalDocs / limit)

  query = query.skip(startIndex).limit(limit)

  // Populate
  if (populate) {
    query = query.populate(populate)
  }

  // Executing query
  const results = await query

  // Pagination result
  const pagination = {
    totalDocs,
    limit,
    totalPages,
    page,
  }

  if (endIndex < totalDocs) {
    pagination.nextPage = page + 1
  }

  if (startIndex > 0) {
    pagination.prevPage = page - 1
  }

  return {
    docs: results,
    ...pagination,
  }
}

export default advancedFiltering
