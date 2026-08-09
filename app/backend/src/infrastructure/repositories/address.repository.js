const db = require('../config/database.config');
const Address = require('../../domain/entities/Address');

/**
 * Repositorio de Infraestructura para Direcciones.
 * Encargado de transformar consultas SQL de PostgreSQL a Objetos de Dominio Address.
 */
class AddressRepository {

  /**
   * Convierte una fila PostgreSQL a Entidad Address
   */
  _mapRowToEntity(row) {
    if (!row) return null;

    return new Address({
      id: row.id,
      userId: row.user_id,

      title: row.title,

      receiverName: row.receiver_name,
      receiverPhone: row.receiver_phone,

      addressLine1: row.address_line1,
      addressLine2: row.address_line2,

      city: row.city,
      state: row.state,
      postalCode: row.postal_code,

      country: row.country,

      latitude: row.latitude ? parseFloat(row.latitude) : null,
      longitude: row.longitude ? parseFloat(row.longitude) : null,

      isDefault: row.is_default,

      createdAt: row.created_at,
      updatedAt: row.updated_at,
      receiverName: row.receiver_name,
      receiverPhone: row.receiver_phone,
    });
  }


  /**
   * Crear dirección
   */
  async create(addressData) {

    const query = `
      INSERT INTO addresses (
        user_id,
        title,
        receiver_name,
        receiver_phone,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        latitude,
        longitude,
        is_default
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
      )
      RETURNING *;
    `;


    const values = [
      addressData.userId,
      addressData.title,

      addressData.receiverName,
      addressData.receiverPhone,

      addressData.addressLine1,
      addressData.addressLine2,

      addressData.city,
      addressData.state,

      addressData.postalCode,

      addressData.country || 'El Salvador',

      addressData.latitude,
      addressData.longitude,

      addressData.isDefault || false
    ];


    const result = await db.query(query, values);

    return this._mapRowToEntity(result.rows[0]);
  }



  /**
   * Obtener direcciones por usuario
   */
  async findByUserId(userId) {

    const query = `
      SELECT *
      FROM addresses
      WHERE user_id = $1
      ORDER BY is_default DESC, created_at DESC;
    `;


    const result = await db.query(query, [userId]);

    return result.rows.map(row =>
      this._mapRowToEntity(row)
    );
  }



  /**
   * Buscar dirección por ID
   */
  async findById(id) {

    const query = `
      SELECT *
      FROM addresses
      WHERE id = $1;
    `;


    const result = await db.query(query, [id]);

    return this._mapRowToEntity(result.rows[0]);
  }




  /**
   * Actualizar dirección
   */
  async update(id, userId, addressData) {

    const query = `
      UPDATE addresses
      SET
        title = COALESCE($1,title),

        receiver_name = COALESCE($2,receiver_name),
        receiver_phone = COALESCE($3,receiver_phone),

        address_line1 = COALESCE($4,address_line1),
        address_line2 = COALESCE($5,address_line2),

        city = COALESCE($6,city),
        state = COALESCE($7,state),

        postal_code = COALESCE($8,postal_code),

        country = COALESCE($9,country),

        latitude = COALESCE($10,latitude),
        longitude = COALESCE($11,longitude),

        updated_at = CURRENT_TIMESTAMP

      WHERE id = $12
      AND user_id = $13

      RETURNING *;
    `;



    const values = [

      addressData.title,

      addressData.receiverName,
      addressData.receiverPhone,

      addressData.addressLine1,
      addressData.addressLine2,

      addressData.city,
      addressData.state,

      addressData.postalCode,

      addressData.country,

      addressData.latitude,
      addressData.longitude,

      id,
      userId
    ];



    const result = await db.query(query, values);


    return this._mapRowToEntity(result.rows[0]);

  }




  /**
   * Cambiar dirección predeterminada
   */
  async setDefaultAddress(userId, addressId) {

    const client = await db.getClient();


    try {

      await client.query('BEGIN');


      await client.query(
        `
        UPDATE addresses
        SET is_default = FALSE
        WHERE user_id = $1;
        `,
        [userId]
      );



      const result = await client.query(
        `
        UPDATE addresses
        SET
          is_default = TRUE,
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $2
        AND user_id = $1

        RETURNING *;
        `,
        [
          userId,
          addressId
        ]
      );



      await client.query('COMMIT');


      return this._mapRowToEntity(result.rows[0]);



    } catch(error){

      await client.query('ROLLBACK');

      throw error;


    } finally {

      client.release();

    }

  }





  /**
   * Eliminar dirección
   */
  async delete(id,userId){

    const query = `
      DELETE FROM addresses
      WHERE id=$1
      AND user_id=$2
      RETURNING *;
    `;


    const result = await db.query(
      query,
      [
        id,
        userId
      ]
    );


    return this._mapRowToEntity(result.rows[0]);

  }





  /**
   * Contar direcciones del usuario
   */
  async countByUserId(userId){

    const query = `
      SELECT COUNT(*)
      FROM addresses
      WHERE user_id=$1;
    `;


    const result = await db.query(
      query,
      [
        userId
      ]
    );


    return parseInt(
      result.rows[0].count,
      10
    );

  }

}


module.exports = new AddressRepository();