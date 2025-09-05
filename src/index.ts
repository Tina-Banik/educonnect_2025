import express from 'express';
import { config } from '../types/type';
/**import the admin route */
import authRoute from './routes/admin.route';
const app = express();
/**require the body parser */
app.use(express.urlencoded({extended:true}));
app.use(express.json());
/**here I define the admin route */
const adminPath = '/admin';
app.use(`${config.apiUrl}${adminPath}`,authRoute);
app.get('/',(req,res)=>{
    res.send('<h2 style="color:red">Welcome to the Training Management System</h2>')
})
app.listen(config,()=>{
    console.log(`The server listens at port number is : ${config.port} ${config.apiUrl}${adminPath}`)
})