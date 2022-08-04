const button = document.querySelector('#lobby__form').addEventListener('submit',(form_data)=>{
    const name = form_data.target.name.value;
    const room = form_data.target.room.value;
    sessionStorage.setItem('name',name)
    
})

