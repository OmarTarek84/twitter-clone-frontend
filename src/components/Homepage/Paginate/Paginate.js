import React from 'react';
import './Paginate.scss';
import Pagination from "react-js-pagination";

const Paginate = ({handlePageChange, pageSize, totalItemsCount, currentPage }) => {
    return (
        <Pagination
            itemClass="page-item"
            linkClass="page-link"
            activePage={currentPage}
            itemsCountPerPage={pageSize}
            totalItemsCount={totalItemsCount}
            pageRangeDisplayed={10}
            onChange={handlePageChange}
      />
    )
};

export default Paginate;