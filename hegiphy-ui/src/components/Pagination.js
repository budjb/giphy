import React from 'react';
import ReactPaginate from 'react-paginate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const Pagination = ({ display, handler, currentPage, totalPages }) => {
  if (!display) {
    return null;
  }

  return (
    <div className="pagination-container">
      <ReactPaginate
        previousLabel={<FontAwesomeIcon icon={faArrowLeft} />}
        nextLabel={<FontAwesomeIcon icon={faArrowRight} />}
        breakLabel="..."
        breakClassName="break-me"
        pageCount={totalPages}
        forcePage={currentPage}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handler}
        containerClassName="pagination"
        subContainerClassName="pages pagination"
        activeClassName="active"
      />
    </div>
  );
};

export default Pagination;
