//------------------------------------------------------------------
// ----- INSTALAR -----
// Necessário:
// npm install --save dotenv
// npm install @supabase/supabase-js
// npm install pg-listen
// npm install pg --save

//------------------------------------------------------------------
// --------------------------------------
// --------------SETTINGS----------------
// --------------------------------------
const logAuthErrors = false
const logUpdateErrors = false


//------------------------------------------------------------------
// --------------------------------------
// ---------------IMPORTS----------------
// --------------------------------------
require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')



//------------------------------------------------------------------
// --------------------------------------
// ---------HELPER FUNCTIONS-------------
// --------------------------------------
// Essa primeira parte é dedicada à criação de funções essenciais para o funcionamento
function supabaseInit() {
    return createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        {
            auth: {
                autoRefreshToken: true,
                persistSession: false,
            }
        }
    )
}

async function singInAsRottas() {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: process.env.SUPABASE_ROTTAS_USER_EMAIL,
        password: process.env.SUPABASE_ROTTAS_USER_PSWD
    })
    if (logAuthErrors) {
        console.log(data)
        console.log(error)
    }

}

async function updatePosition(gpsId, latitude, longitude, updatedAt) {
    const { error } = await supabase
        .from('gps_positions')
        .update({ latitude: latitude, longitude: longitude, updated_at: updatedAt })
        .eq('gps_id', gpsId);

    if (logUpdateErrors) {
        console.log(error)
    }
}

async function getPosition(gpsId) {
    const { data, error } = await supabase
        .from('gps_positions')
        .select('latitude,longitude,updated_at')
        .eq('gps_id', gpsId);


    return data;
}

//------------------------------------------------------------------
// --------------------------------------
// --------------NODE APP----------------
// --------------------------------------
const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Rottas Tracking Management');
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

//------------------------------------------------------------------
// --------------------------------------
// ---------POSTGRES CONNECTION----------
// --------------------------------------
// ----- Criar client -----
const { Client } = require('pg')
// const client = new Client({
//     // ISSO AQUI TB PODERIA FICAR NO .ENV
//     // DEPENDE INTEIRAMENTE DO DB QUE VC TÁ USANDO
//     'user': 'postgres',
//     'host': 'localhost',
//     'database': 'traccarrottas',
//     'password': '1234abcd',
//     'port': 5432
// });

const client = new Client({
    'user': process.env.POSTGRES_USER,
    'host': process.env.POSTGRES_HOST,
    'database': process.env.POSTGRES_DATABASE,
    'password': process.env.POSTGRES_PASSWORD,
    'port': process.env.POSTGRES_PORT
});

async function start() {
    // Inicializa supabase
    supabase = await supabaseInit()
    // Faz login
    await singInAsRottas()

    // ----- Conectar client -----
    client.connect(function (err, client) {

        query = client.query('LISTEN tc_pos_event');
        //@ client.on:
        //se for "tc_pos_event" no lugar de "notification" não atualiza
        client.on('notification', (data) => {
            // Determina dispositivo a ser atualizado
            deviceJsonPayload = JSON.parse(data.payload)

            //---QUERIES THE POSITIONS AND DEVICE DATA---
            deviceId = deviceJsonPayload.deviceid
            // textQuery = `SELECT tc_positions.latitude, tc_positions.longitude, tc_devices.attributes, tc_positions.deviceid, tc_positions.servertime FROM tc_positions LEFT JOIN tc_devices on tc_devices.id=tc_positions.deviceid WHERE tc_devices.id=${deviceId} ORDER BY tc_positions.servertime DESC LIMIT 1`
            textQuery = `SELECT  tc_positions.latitude,  tc_positions.longitude,  tc_devices.attributes,  tc_positions.deviceid, tc_positions.servertime  FROM tc_positions  LEFT JOIN tc_devices  on tc_devices.id=tc_positions.deviceid  WHERE tc_devices.id=${deviceId} ORDER BY tc_positions.servertime DESC LIMIT 1`

            result = client.query(
                textQuery 
            ).then((value) => {
                payload = value.rows[0]
                // Só atualiza se tiver o atributes com supa id cadastrada
                if (payload.attributes) {
                    attributesPayload = JSON.parse(payload.attributes)
                    if (attributesPayload.supa_uuid) {
                        // console.log(attributesPayload.supa_uuid)
                        // console.log(payload.latitude)
                        // console.log(payload.longitude)
                        // console.log(payload.servertime)
                        updatePosition(
                            gpsId = attributesPayload.supa_uuid,
                            latitude = payload.latitude,
                            longitude = payload.longitude,
                            updatedAt = payload.servertime);
                    }
                }
            })
        });
    });
}
start();


