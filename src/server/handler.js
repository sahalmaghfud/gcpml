const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const { storeData } = require('../services/storeData');
const getAllData = require('../services/getAllData');
const InputError = require('../exceptions/InputError');

async function postPredictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;

  // Validasi keberadaan file
  if (!image) {
    throw new InputError('File gambar tidak ditemukan', 400);
  }

  try {
    // Proses prediksi menggunakan model
    const { label, suggestion } = await predictClassification(model, image);

    // Buat data respons
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const data = {
      id,
      result: label,
      suggestion,
      createdAt,
    };

    // Simpan data ke Firestore
    await storeData(id, data);

    return h.response({
      status: 'success',
      message: 'Model is predicted successfully',
      data,
    }).code(201);

  } catch (error) {
    throw new InputError('Terjadi kesalahan dalam melakukan prediksi', 400);
  }
}

async function postPredictHistoriesHandler(request, h) {
  try {
    const allData = await getAllData();

    const formatAllData = allData.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        history: {
          result: data.result,
          createdAt: data.createdAt,
          suggestion: data.suggestion,
          id: doc.id,
        },
      };
    });

    return h.response({
      status: 'success',
      data: formatAllData,
    }).code(200);

  } catch (error) {
    throw new InputError('Gagal mengambil riwayat prediksi', 500);
  }
}

module.exports = { postPredictHandler, postPredictHistoriesHandler };