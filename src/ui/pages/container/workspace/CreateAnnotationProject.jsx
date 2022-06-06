import { Box, Card, Grid, Tab, Tabs, ThemeProvider, Typography } from "@mui/material";
import React, { useState } from "react";
import Header from "../../component/common/Header";
import themeDefault from '../../../theme/theme'
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from "../../component/common/Button"
import OutlinedTextField from "../../component/common/OutlinedTextField";
import DatasetStyle from "../../../styles/Dataset";
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


const ProjectSetting = (props) => {

    const classes = DatasetStyle();
    const [selectmenu, setselectmenu] = React.useState('');

    const handleChange = (event) => {
        setselectmenu(event.target.value);
    };

    return (
        <ThemeProvider theme={themeDefault}>

            <Header />
            <Grid
                container
                direction='row'
                justifyContent='center'
                alignItems='center'
                width={window.innerWidth}
            >
                <Card
                    sx={{
                        width: window.innerWidth * 0.8,
                        minHeight: 500,
                        padding: 5
                    }}

                >

                    <Grid
                        item
                        xs={12}
                        sm={12}
                        md={12}
                        lg={12}
                        xl={12}
                    >
                        <Typography variant="h2" gutterBottom component="div">

                            Create a Project
                        </Typography>
                    </Grid>

                    <Grid
                        container
                        direction='row'
                        style={{ margin: "20px 0px 0px 0px" }}
                    >
                        <Grid
                            items
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                        >
                            <Typography gutterBottom component="div" label="Required">
                                Title:
                            </Typography>
                        </Grid>
                        <Grid
                            item
                            xs={12}
                            md={12}
                            lg={12}
                            xl={12}
                            sm={12}
                        >
                            <OutlinedTextField
                                fullWidth


                            />
                        </Grid>
                    </Grid>
                    <Grid
                        container
                        direction='row'
                        style={{ margin: "20px 0px 0px 0px" }}
                    >
                        <Grid
                            items
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                        >

                            <Typography gutterBottom component="div">
                                Description:
                            </Typography>
                        </Grid>
                        <Grid
                            item
                            xs={12}
                            md={12}
                            lg={12}
                            xl={12}
                            sm={12}
                        >
                            <OutlinedTextField
                                fullWidth


                            />
                        </Grid>
                        <Grid
                            items
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                        >

                            <Typography gutterBottom component="div">
                                Select a domain to work in:
                            </Typography>
                        </Grid>
                        <Grid
                            item
                            xs={12}
                            md={12}
                            lg={12}
                            xl={12}
                            sm={12}
                        >
                            <Box sx={{ minWidth: 120 }}>
                                <FormControl fullWidth>

                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={selectmenu}
                                        onChange={handleChange}
                                    >
                                        <MenuItem value={"Translation"}>Translation</MenuItem>
                                        <MenuItem value={"OCR"}>OCR</MenuItem>
                                        <MenuItem value={"Monolingual"}>Monolingual</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Grid>

                    </Grid>
                    <Grid

                        style={{ margin: "15px 0px 10px 0px", }}
                        item
                        xs={12}
                        md={12}
                        lg={12}
                        xl={12}
                        sm={12}
                    >
                        <Button label="Create Project" />
                        <Button label="Cancel" />
                    </Grid>



                </Card>
            </Grid>
        </ThemeProvider>

    )
}

export default ProjectSetting;