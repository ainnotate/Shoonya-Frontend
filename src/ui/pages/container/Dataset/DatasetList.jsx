import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from 'react-router-dom';
import MUIDataTable from "mui-datatables";
import APITransport from '../../../../redux/actions/apitransport/apitransport';
import { useDispatch, useSelector } from 'react-redux';
import CustomButton from "../../component/common/Button";
import { ThemeProvider } from "@mui/material";
import tableTheme from "../../../theme/tableTheme";
import GetDatasetsAPI from "../../../../redux/actions/api/Dataset/GetDatasetList";

const DatasetList = (props) => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();

    const datasetList = useSelector(state=>state.getDatasetList.data);
    console.log(datasetList,"datasetList")
    const getDashboardprojectData = () => {

        const projectObj = new GetDatasetsAPI();
        dispatch(APITransport(projectObj));
       
    }


    useEffect(() => {
        getDashboardprojectData();

    }, []);

    
    const columns = [
        {
            name: "Project_id",
            label: "Project Id",
            options: {
                filter: false,
                sort: false,
                align: "center"
            }
        },
        {
            name: "Project_Title",
            label: "Project Title",
            options: {
                filter: false,
                sort: false,
                align: "center"
            }
        },


        {
            name: "project_Type",
            label: "project Type",
            options: {
                filter: false,
                sort: false,
            }
        },
       
        {
            name: "Action",
            label: "Action",
            options: {
                filter: false,
                sort: false,
                align: "center"
            }
        },

    ];



    const data = datasetList && datasetList.length > 0 ? datasetList.map((el, i) => {
        return [
            el.instance_id,
            el.instance_name,
            el.dataset_type,
            <Link to={`/projects/${el.id}`} style={{ textDecoration: "none" }}>
            <CustomButton
                sx={{ borderRadius: 2, marginRight: 2 }}
                label="View"
            />
       </Link>
        ]
    }) : [];

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

    return (
        <div>
            <ThemeProvider theme={tableTheme}>
                

                <MUIDataTable
                    title={""}
                    data={data}
                    columns={columns}
                    options={options}
                />
            </ThemeProvider>

        </div>

    )
}

export default DatasetList;