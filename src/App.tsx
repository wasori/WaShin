import { Breadcrumb, Card, Col, Flex, Layout, Menu, Row, theme, } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import styled from 'styled-components';
import './App.css';
import { AliwangwangOutlined } from "@ant-design/icons";

const items = new Array(15).fill(null).map((_, index) => ({
    key: index + 1,
    label: `nav ${index + 1}`,
}));

const FullHeightLayout = styled(Layout)`
  min-height: 100vh;
`;

const ContentDiv = styled(Content)`
  background-color: #001529;
  height: calc(100vh - 64px); /* Header 높이 제외 */
  display: flex;
`;

const ColDiv = styled.div`
    background: '#0092ff';
    padding: '8px 0';
    height: '150px';
`

function App() {
    return (
        <FullHeightLayout>
            <Header style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgb(52, 58, 71)' }}>
                <AliwangwangOutlined style={{ fontSize: '30px', color: '#fff', marginRight: '7px' }} />
                <div style={{ fontSize: '26px', color: '#fff', fontWeight: 'bold' }}>WaShin</div>
            </Header>
            <ContentDiv style={{ padding: '0 30px' }}>
                <div style={{ width: '80%', height: '100%' }}>
                    <div style={{ width: '100%', height: '59%', padding: '5px' }}>
                        <Row gutter={[16, 24]}>
                            <Col className="gutter-row" span={6}>
                                <ColDiv>
                                    <Card className="card-size">
                                    </Card>
                                </ColDiv>
                            </Col>
                            <Col className="gutter-row" span={6}>
                                <Card className="card-size">
                                </Card>
                            </Col>
                            <Col className="gutter-row" span={6}>
                                <Card className="card-size">
                                </Card>
                            </Col>
                            <Col className="gutter-row" span={6}>
                                <Card className="card-size">
                                </Card>
                            </Col>
                            <Col className="gutter-row" span={6}>
                                <Card className="card-size">
                                </Card>
                            </Col>
                            <Col className="gutter-row" span={6}>
                                <Card className="card-size">
                                </Card>
                            </Col>
                            <Col className="gutter-row" span={6}>
                                <Card className="card-size">
                                </Card>
                            </Col>
                            <Col className="gutter-row" span={6}>
                                <Card className="card-size">
                                </Card>
                            </Col>
                        </Row>
                    </div>
                    <div style={{ border: '2px solid rgb(52, 58, 71)' }}></div>
                    <div style={{ width: '100%', height: '39%' }}></div>
                </div>
                <div style={{ width: '20%', height: '100%' }}>

                </div>
            </ContentDiv>
        </FullHeightLayout>
    )
}

export default App;