// Esse códiog é lixo mesmo

// Resultado de desenvolvimento que NÃO será usado.Esse

// Mantido APENAS para consulta.

require('dotenv').config()

const { createClient } = require('@supabase/supabase-js')


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
    console.log(data)
    console.log(error)
}

async function updatePosition(gpsId, latitude, longitude, updatedAt = null) {
    const { error } = await supabase
        .from('gps_positions')
        .update({ latitude: latitude, longitude: longitude })
        .eq('gps_id', gpsId);
}

async function getPosition(gpsId) {
    const { data, error } = await supabase
        .from('gps_positions')
        .select('latitude,longitude,updated_at')
        .eq('gps_id', gpsId);


    return data;
}


// Essa é a maneira básica de executar:
async function mainTest(){
    // Inicializa supabase
    supabase = await supabaseInit();
    // Faz login
    await singInAsRottas()
    // Atualiza a posição
    await updatePosition(gpsId='534add5e-83a3-44b6-8992-ef0125a6e3a6', latitude=-3.7391613, longitude=-38.5717656, updatedAt = null)
    // Checa e printa (NÃO OBRIGATÓRIO!)
    posGet = await getPosition('534add5e-83a3-44b6-8992-ef0125a6e3a6')
    console.log(posGet)
}
mainTest();


// // // Essa função existiu somente para ver se tava tudo OK do lado do supa. Não usar. Tá aqui só pra referência.
// // async function test1() {
// //     // var date = Date().toISOString().slice(0, 19).replace('T', ' ');
// //     // var date = Date.now();
// //     // date = Date(Date.now())
// //     // date = date.toISOString()
// //     // console.log(date)

// //     //--------------------------------------------
// //     // // OK!
// //     // // Confirmando que consulta funciona
// //     // const {data, error} = await supabase.from('vehicles_positions').select('latitude,longitude');
// //     // data.forEach(function(d){
// //     //     console.log(d)
// //     // });

// //     //--------------------------------------------
// //     // // OK! Não dá update e erro vem como null (esperei um erro mesmo mas enfim)
// //     // // Testando update sem autorização
// //     // const {error} = await supabase.from('gps_positions').update({latitude:-3.73, longitude:-38.57}).eq('gps_id', '534add5e-83a3-44b6-8992-ef0125a6e3a6');
// //     // console.log(error)

// //     //--------------------------------------------
// //     // //???????
// //     // // Testando update, após devido login
// //     const { data, error } = await supabase.auth.signInWithPassword({
// //         email: process.env.SUPABASE_ROTTAS_USER_EMAIL,
// //         password: process.env.SUPABASE_ROTTAS_USER_PSWD
// //     })
// //     console.log(data)
// //     console.log(error)

// //     //-----------------------------------------------------
// //     // TODO DATE IN TIME_STAMP FORMAT
// //     // Se não for possível, simplesmente excluir ela dos argumentos
// //     // Acredito que o db do traccar já venha com a data, então n precisaria pegar pelo javascript...

// //     const { data: { user } } = await supabase.auth.getUser()
// //     console.log('USER!!!!')
// //     console.log(user)
// //     // const {error:updateError} = await supabase.from('gps_positions').update({latitude:-3.7391613, longitude:-38.5717656, updated_at:Date().toISOString().slice(0, 19).replace('T', ' ')}).eq('gps_id', '534add5e-83a3-44b6-8992-ef0125a6e3a6');
// //     updatedAt = null // var date = Date.now().toISOString();
// //     // const {error:updateError} = await supabase.from('gps_positions').update({latitude:-3.7391613, longitude:-38.5717656, updated_at:updatedAt}).eq('gps_id', '534add5e-83a3-44b6-8992-ef0125a6e3a6');
// //     const { error: updateError } = await supabase.from('gps_positions').update({ latitude: -3.7391, longitude: -38.5717 }).eq('gps_id', '534add5e-83a3-44b6-8992-ef0125a6e3a6');
// //     console.log(error)
// //     const { data: selectData, error: selectError } = await supabase.from('gps_positions').select('*').eq('gps_id', '534add5e-83a3-44b6-8992-ef0125a6e3a6');
// //     selectData.forEach(element => {
// //         console.log(element)
// //     });
// //     console.log(selectError)

// //     await supabase.auth.signOut()
// // }











// ----- INSTALAR -----
// Necessário:
// npm install --save dotenv
// npm install @supabase/supabase-js
// npm install pg-listen
// npm install pg --save

// ----- REFERÊNCIA -----
//ref: https://github.com/andywer/pg-listen


// ----- NODE PURO EXEMPLO DA DOC DELES -----
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

// --------------------
// ----- POSTGRES -----
// --------------------

// ----- Criar client -----
// Usando client (não sei a diferença dele pro pool zz)
const { Client } = require('pg')
const client = new Client({
    'user': 'postgres',
    'host': 'localhost',
    'database': 'rottassim',
    'password': '1234abcd',
    'port': 5432
});

// ----- Conectar client -----
// subscribe conforme https://arctype.com/blog/postgres-notify-for-real-time-dashboards/
// WATCH V2
client.connect(function (err, client) {
    // ----- Escutar notificações específicas para atualização em posição -----
    query = client.query('LISTEN tc_pos_event');
    //No client.on:
    //se for "tc_pos_event" no lugar de "notification" não atualiza, ok!
    client.on('notification', (data) => {
        updatePosition(gpsId='534add5e-83a3-44b6-8992-ef0125a6e3a6', latitude=-3.7391613, longitude=-38.5717656, updatedAt = null)
        console.log('TC POS NOTIFICATION', data)
        console.log(data.payload)
        console.log(JSON.parse(data.payload))
    });
});
