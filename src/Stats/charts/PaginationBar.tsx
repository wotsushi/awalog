import { useState } from 'react';
import { Pagination } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import styled from 'styled-components';

import { Deck } from 'lib/result';
import { MediaValue, useMedia } from 'lib/useMedia';

const ChartPagination = styled(Pagination)`
  justify-content: center;
  margin-top: 10px;
`;

type BarProps = React.ComponentProps<typeof Bar>;

type Props = {
  pageSizeByMedia: {
    [M in MediaValue]: number;
  };
  decks: Deck[];
  subjectID: number;
  options: BarProps['options'];
  data: {
    labels: (string | undefined)[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      stack?: string;
    }[];
  };
};

const PaginationBar = ({
  pageSizeByMedia,
  decks,
  options,
  data,
  subjectID,
}: Props) => {
  const media = useMedia();
  const [pages, setPages] = useState(() =>
    [...Array(decks.length + 1)].map(() => 0)
  );
  const page = pages[subjectID];
  const pageSize = pageSizeByMedia[media];
  const slice = <T,>(a: T[]) => a.slice(pageSize * page, pageSize * (page + 1));
  const maxPage = Math.ceil(data.labels.length / pageSize);
  return (
    <>
      <Bar
        options={options}
        data={{
          labels: slice(data.labels),
          datasets: data.datasets.map((dataset) => ({
            ...dataset,
            data: slice(dataset.data),
          })),
        }}
      />
      {maxPage > 1 && (
        <ChartPagination>
          {[...Array(Math.ceil(data.labels.length / pageSize))].map((_, i) => (
            <Pagination.Item
              key={i}
              active={i === page}
              onClick={() =>
                setPages(pages.map((page, j) => (j === subjectID ? i : page)))
              }
            >
              {i + 1}
            </Pagination.Item>
          ))}
        </ChartPagination>
      )}
    </>
  );
};

export default PaginationBar;
