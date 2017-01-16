import React, {Component} from 'react'
import { View, Text, StyleSheet, ListView, Keyboard, AsyncStorage, ActivityIndicator } from 'react-native';
import Header from './header';
import Footer from './footer';
import Row from './row';

class App extends Component {
  constructor(props) {
    super(props);

    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    this.state = {
      loading: true,
      allComplete: false,
      value: '',
      items: [],
      dataSource: ds.cloneWithRows([])
    }

    this.handleRemoveItem = this.handleRemoveItem.bind(this);
    this.handleToggleComplete = this.handleToggleComplete.bind(this);
    this.setSource = this.setSource.bind(this);
    this.handleAddItem = this.handleAddItem.bind(this);
    this.handleToggleAllComplete = this.handleToggleAllComplete.bind(this);
  }

  componentWillMount () {
    AsyncStorage.getItem('items').then((json) => {
      try {
        const items = JSON.parse(json);
        this.setSource(items, items, { loading: false });
      } catch(e) {
        this.setState({
          loading: false
        });
      }
    });
  }

  setSource(items, itemsDatasource, otherState = {}) {
    this.setState({
      items,
      dataSource: this.state.dataSource.cloneWithRows(itemsDatasource),
      ...otherState
    });
    AsyncStorage.setItem('items', JSON.stringify(items));
  }

  handleRemoveItem(key) {
    const newItems = this.state.items.filter((item) => item.key !== key);
    this.setSource(newItems, newItems);
  }

  handleToggleComplete(key, complete) {
    const newItems = this.state.items.map((item) => {
      if (item.key !== key) return item;
      return {
        ...item,
        complete
      }
    });
    this.setSource(newItems, newItems);
  }

  handleToggleAllComplete() {
    const complete = !this.state.allComplete;
    const newItems = this.state.items.map((item) => ({
      ...item,
      complete
    }));

    this.setSource(newItems, newItems, {allComplete: complete});

  }

  handleAddItem() {
    if (!this.state.value) return;

    const newItems = [
      ...this.state.items,
      {
        key: Date.now(),
        text: this.state.value,
        complete: false
      }
    ];

    this.setSource(newItems, newItems, {value: ''});
  }

  render() {
    return (
      <View style={styles.container}>
        <Header
          value = {this.state.value}
          onAddItem = {this.handleAddItem}
          onChange = {(value) => this.setState({value})}
          onToggleAllComplete = {this.handleToggleAllComplete}
        />
        <View style={styles.content}>
          <ListView
            style = {styles.list}
            enableEmptySections
            dataSource = {this.state.dataSource}
            onScroll = {() => Keyboard.dismiss()}
            renderRow = {(item) => {
              return (
                <Row
                  key = {item.key}
                  onComplete = {(complete) => this.handleToggleComplete(item.key, complete)}
                  complete = {item.complete}
                  text = {item.text}
                  onRemove = {this.handleRemoveItem}
                />
              );
            }}
            renderSeparator = {(sectionId, rowId) => {
              return <View key = {rowId} style = {styles.separator} />
            }}
          />
         </View>
        <Footer />
        {this.state.loading && <View style = {styles.loading}>
          <ActivityIndicator
            animating
            size='large'
          />
        </View>}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 30
  },
  loading: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,.2)'
  },
  content: {
    flex: 1
  },
  list: {
    backgroundColor: '#fff'
  },
  separator: {
    borderWidth: 1,
    borderColor: '#f5f5f5'
  }
});

export default App