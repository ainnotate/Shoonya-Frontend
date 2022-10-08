import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import MUIDataTable from "mui-datatables";
import CustomButton from "../../component/common/Button";
import { Grid, ThemeProvider } from "@mui/material";
import tableTheme from "../../../theme/tableTheme";
import Search from "../../component/common/Search";
import { useDispatch, useSelector } from 'react-redux';


const ProjectCardList = (props) => {
    const { projectData } = props
    const SearchProject = useSelector((state) => state.SearchProjectCards.data);

    const pageSearch = () => {

        return projectData.filter((el) => {

            if (SearchProject == "") {

                return el;
            } else if (
                el.project_type
                    ?.toLowerCase()
                    .includes(SearchProject?.toLowerCase())
            ) {

                return el;
            } else if (
                el.project_mode
                    ?.toLowerCase()
                    .includes(SearchProject?.toLowerCase())
            ) {



                return el;
            } else if (
                el.title
                    ?.toLowerCase()
                    .includes(SearchProject?.toLowerCase())
            ) {



                return el;
            } else if (
                el.id.toString()?.toLowerCase()
                    ?.includes(SearchProject.toLowerCase())
            ) {

                return el;
            }


        })

    }
    const columns = [
        {
            name: "Project_id",
            label: "Project Id",
            options: {
                filter: false,
                sort: false,
                align: "center",
                setCellHeaderProps: sort => ({ style: { height: "70px", fontSize: "16px", padding: "16px" } }),
            }
        },
        {
            name: "Project_Title",
            label: "Project Title",
            options: {
                filter: false,
                sort: false,
                align: "center",
                setCellHeaderProps: sort => ({ style: { height: "70px", fontSize: "16px", padding: "16px" } }),

            }
        },
        {
            name: "project_Type",
            label: "Project Type",
            options: {
                filter: false,
                sort: false,
                align: "center",

                setCellHeaderProps: sort => ({ style: { height: "70px", fontSize: "16px", padding: "16px" } }),

            }
        },
        {
            name: "Project_mode",
            label: "Project Mode",
            options: {
                filter: false,
                sort: false,
                align: "center",
                setCellHeaderProps: sort => ({ style: { height: "70px", fontSize: "16px", padding: "16px" } }),

            }
        },
        {
            name: "Action",
            label: "Action",
            options: {
                filter: false,
                sort: false,
                align: "center",
                setCellHeaderProps: sort => ({ style: { height: "70px", fontSize: "16px" } }),
            }
        }];


    const data = projectData && projectData.length > 0 ? pageSearch().map((el, i) => {
        return [
            el.id,
            el.title,
            el.project_type,
            el.project_mode,
            <Link to={`/projects/${el.id}`} style={{ textDecoration: "none" }}>
                <CustomButton
                    sx={{ borderRadius: 2, marginRight: 2 }}
                    label="View"
                />
            </Link>

        ]
    })
        : [];

    const options = {
        textLabels: {
            body: {
                noMatch: "No records",
            },
            toolbar: {
                search: "Search",
                viewColumns: "View Column",
            },
            pagination: { rowsPerPage: "Rows per page" },
            options: { sortDirection: "desc" },
        },
        // customToolbar: fetchHeaderButton,
        displaySelectToolbar: false,
        fixedHeader: false,
        filterType: "checkbox",
        download: false,
        print: false,
        rowsPerPageOptions: [10, 25, 50, 100],
        // rowsPerPage: PageInfo.count,
        filter: false,
        // page: PageInfo.page,
        viewColumns: false,
        selectableRows: "none",
        search: false,
        jumpToPage: true,

    };
    // const renderSearch = () => {
    //     return (
    //         <Search />
    //     );
    // };

    return (
        <ThemeProvider theme={tableTheme}>
            <MUIDataTable
                title={""}
                data={data}
                columns={columns}
                options={options}
            />
        </ThemeProvider>
    )
}

export default ProjectCardList;