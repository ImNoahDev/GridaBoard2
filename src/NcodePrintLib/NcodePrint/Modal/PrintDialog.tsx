import React from "react";
import { Container, Modal, Row, Col, Button } from "react-bootstrap";


interface Props {
  onHide: any, // (event: MouseEvent<HTMLElement, MouseEvent>) => void
  show: boolean,
}

interface State {

}

// https://react-bootstrap.github.io/components/modal/#modals-live
export class MyDialog extends React.Component<Props, State> {
  render() {
    const props = this.props;

    return (
      <Modal {...props} aria-labelledby="contained-modal-title-vcenter">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            인쇄 설정
        </Modal.Title>
        </Modal.Header>
        <Modal.Body className="show-grid">
          <Container>
            <Row>
              <Col xs={12} md={8}>
                .col-xs-12 .col-md-8
            </Col>
              <Col xs={6} md={4}>
                .col-xs-6 .col-md-4
            </Col>
            </Row>

            <Row>
              <Col xs={6} md={4}>
                .col-xs-6 .col-md-4
            </Col>
              <Col xs={6} md={4}>
                .col-xs-6 .col-md-4
            </Col>
              <Col xs={6} md={4}>
                .col-xs-6 .col-md-4
            </Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );

  }
}