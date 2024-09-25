
import { Grid, Link, Typography, Hidden,ThemeProvider, Box, } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { translate } from "../../../../config/localisation";
import LoginAPI from "../../../../redux/actions/api/UserManagement/Login";
import LoginStyle from "../../../styles/loginStyle";
import Button from "../../component/common/Button";
import CustomCard from "../../component/common/Card";
import OutlinedTextField from "../../component/common/OutlinedTextField";
import themeDefault from '../../../theme/theme'



export default function AppInfo() {
    let navigate = useNavigate();
    const classes = LoginStyle();
    const routeChange = () =>{ 
        let path = `dashboard`; 
        navigate(path);
      }
  return (
    <div style={{alignItems: 'center', justifyContent: 'center'}}>
    
    <img src={"haidata_logo_grey.png"} alt="logo" style={{alignItems: 'center', width:"70%", justifyContent: 'center', marginTop: '10%', marginLeft: '12%'}} />  
    <Grid container>
      
         <Grid item xs={12} sm={12} md={12} lg={12} xl={12}  >
         <Typography  variant={"h2"} className={classes.title}  style={{ margin: "10% 294px 10% 39px"}} onClick={routeChange} >Data Annotation Platform</Typography>
         </Grid>
         <Hidden only="xs">
         <Typography variant={"body1"} className={classes.body} style={{ margin: "20px 0px 50px 39px",}}>
         {translate("label.shoonyaInfo")}
         </Typography>
         </Hidden>
    </Grid>
    </div>
  )
}
