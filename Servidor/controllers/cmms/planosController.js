const dbMysqlDev = require("../../DataBase/MySqlDatabaseDev");


exports.obtenerPlanos = async (req, res) => {
    try{
        const rows = await dbMysqlDev.executeQuery("SELECT * FROM tbl_planos")
    res.json(rows)
    } catch (err){
        res.status(500).json({error:"Error al obtener los planos"})
    }
}