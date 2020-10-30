const experss=require('express')
const route=experss.Router()
const mongoose=require('mongoose')
const bycrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const {JWT_SEC_KEY} = require('../key')
const User=mongoose.model("User")
const requireLogin = require('../middleware/requireLogin')
route.get('/protected',requireLogin,(req,res)=>{
    res.send("Hello World")
})
route.post('/signup',(req,res)=>{

    console.log(req.body)
    const  { name, email, password}=req.body

    if(!name || !email || !password )
    {
        return res.status(422).json({err:"Please fill all fields"})
    }

    User.findOne({email:email})
    .then(savedUser=>{
        if(savedUser)
        {  
              console.log(savedUser)
            return res.json({err:"User Already exist"})
        }    
       bycrypt.hash(password,12)
       .then(hashpassword=>{
        const urs=new User({
            name,
            email,
            password:hashpassword
        })

        urs.save()
        .then(()=>{

            res.json({message:"User saved"})
        })

        .catch(err=>{

            console.log(err)
        })
       })
      
    })
    .catch(err=>{

        console.log(err)
    })
})

route.post('/signin',(req,res)=>{
    const {email, password}= req.body;
    if(!email || !password)
    {
      return  res.status(422).json({
            err:"Please add email or password"
        })
    }
    User.findOne({email:email})
    .then(savedUser=>{
        if(savedUser)
        {
            bycrypt.compare(password,savedUser.password)
            .then(doMatch=>{
                if(doMatch)
                {
                    const token=jwt.sign({_id:savedUser._id},JWT_SEC_KEY)
                    res.json({
                        token
                    })
                }
                else{
                  return  res.json({
                        err:"Wrong email or passWord"
                    })
                }
            })
            .catch(err=>{
                console.log(err)
            })
        }
        else{
             return res.json({
                 err:"Wrong email or passWord"
             })
        }
    })
    .catch(err=>{
        console.log(err)
    })
})

module.exports =route