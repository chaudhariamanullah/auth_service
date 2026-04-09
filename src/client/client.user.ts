const UserClient = {

  async checkPhone(phone: string) {

    const res = await fetch(`http://localhost:3002/users/phone-exists/${phone}`,);

    const data = await res.json() as any;
    return data;

  },

  async addNewUser(user_public_id:string,user_fname:string | undefined ,user_lname:string | undefined){

    const res = await fetch(`http://localhost:3002/users/google`,{
      method:"POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
          user_public_id,
          user_fname,
          user_lname
      })
    })

    if(!res.ok)
      return false

    if(res.status === 201)
      return true
    else
      return false
  }
  
};

export default UserClient;
