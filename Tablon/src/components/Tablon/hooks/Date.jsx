export const formateDate = (fecha) => {
    const formate = { year: 'numeric', month :'numeric', day :'numeric', hour :'numeric', minute :'numeric'};
        return new Date(fecha).toLocaleDateString(undefined,formate);
};