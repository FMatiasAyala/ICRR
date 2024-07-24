export const fetchAnuncios = async () => {
    try {
        const response = await fetch ('http://192.168.1.53:3000/anuncios');
        const data = await response.json();
/*         const anuncio = data.sort((a,b) => new Date (b.createdAt) - new Date (a.createdAt)); */
        return data;
    }catch (err) {
        console.error('Error fetching anuncios: '+ err.message)
    }
}

export const updateAnuncio = async (id, updatedData) => {
    try {
        const response = await fetch(`http://192.168.1.53:3000/anuncios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el anuncio');
        }

        return await response.json();
    } catch (error) {
        console.error('Error al actualizar el anuncio:', error);
        throw error;
    }
};


export const fetchUser = async () => {
    try {
        const response = await fetch ('http://192.168.1.53:3000/user');
        const data = await response.json();
/*         const anuncio = data.sort((a,b) => new Date (b.createdAt) - new Date (a.createdAt)); */
        return data;
    }catch (err) {
        console.error('Error fetching anuncios: '+ err.message)
    }
}
