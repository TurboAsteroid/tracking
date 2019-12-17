module.exports = function (app, cfg, router) {
  const mysqlConfig = cfg.mysqlConfig
  const mysql = require('mysql2/promise')

  router.get('/api/pathfinder/path', async function (req, res) {
    var json = []
    try {
      const connection = await mysql.createConnection(mysqlConfig)
      const [rows, fields] = await connection.execute('select * from tracking_pathfinder')
      connection.close()
      for (var i = 0; i < rows.length; i++) {
        json.push(JSON.parse(rows[i].node))
      }
      res.status(200).json(json)
    } catch (e) {
      res.status(500).send(e.message)
    }
  })
  router.post('/api/pathfinder/path', async function (req, res) {
    try {
      const connection = await mysql.createConnection(mysqlConfig)
      await connection.execute('DELETE FROM traccar.tracking_pathfinder;')
      for (var i = 0; i < req.body.length; i++) {
        await connection.execute(`INSERT INTO traccar.tracking_pathfinder (\`node\`) VALUES ('${JSON.stringify(req.body[i])}');`)
      }
      res.status(200).end()
      connection.close()
    } catch (e) {
      res.status(500).send(e.message)
    }
  })
}
